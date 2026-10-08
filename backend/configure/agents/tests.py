import datetime

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from citoyens.models import Administration, Creneau, Demarche, RendezVous

from .models import Agent


class EspaceAgentTestCase(APITestCase):
    """Deux administrations, chacune avec un agent, et quelques comptes particuliers."""

    def setUp(self):
        self.mairie = Administration.objects.create(nom="Mairie de Brazzaville", ville="Brazzaville")
        self.prefecture = Administration.objects.create(nom="Préfecture du Pool", ville="Kinkala")

        self.carte = Demarche.objects.create(administration=self.mairie, nom="Carte d'identité", duree_minutes=30)
        self.passeport = Demarche.objects.create(administration=self.prefecture, nom="Passeport", duree_minutes=45)

        self.agent_mairie = self.creer_agent("agent_mairie", self.mairie)
        self.agent_prefecture = self.creer_agent("agent_prefecture", self.prefecture)

    def creer_agent(self, username, administration, actif=True):
        utilisateur = User.objects.create_user(username=username, password="motdepasse123")
        Agent.objects.create(utilisateur=utilisateur, administration=administration, actif=actif)
        return utilisateur

    def se_connecter_en_tant_que(self, utilisateur):
        token, _ = Token.objects.get_or_create(user=utilisateur)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")


class GestionDesDemarchesTests(EspaceAgentTestCase):
    URL = "/api/agents/demarches/"

    def test_l_agent_ne_voit_que_les_demarches_de_son_administration(self):
        Demarche.objects.create(administration=self.mairie, nom="Acte de naissance", actif=False)
        Demarche.objects.create(administration=self.prefecture, nom="Visa", actif=False)
        self.se_connecter_en_tant_que(self.agent_mairie)

        reponse = self.client.get(self.URL)

        self.assertEqual(reponse.status_code, 200)
        noms = {d["nom"] for d in reponse.json()}
        # Les démarches suspendues restent visibles pour l'agent, celles des autres administrations non.
        self.assertEqual(noms, {"Carte d'identité", "Acte de naissance"})

    def test_une_nouvelle_demarche_est_rattachee_a_l_administration_de_l_agent(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        reponse = self.client.post(
            self.URL,
            {"nom": "Certificat de résidence", "description": "Justificatif de domicile",
             "duree_minutes": 20, "administration": self.prefecture.id},
            format="json",
        )

        self.assertEqual(reponse.status_code, 201)
        demarche = Demarche.objects.get(nom="Certificat de résidence")
        self.assertEqual(demarche.administration, self.mairie)
        self.assertTrue(demarche.actif)

    def test_l_agent_peut_modifier_une_demarche_de_son_administration(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        reponse = self.client.patch(f"{self.URL}{self.carte.id}/", {"nom": "Carte nationale d'identité", "duree_minutes": 40}, format="json")

        self.assertEqual(reponse.status_code, 200)
        self.carte.refresh_from_db()
        self.assertEqual(self.carte.nom, "Carte nationale d'identité")
        self.assertEqual(self.carte.duree_minutes, 40)

    def test_l_agent_ne_peut_pas_modifier_la_demarche_d_une_autre_administration(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        reponse = self.client.patch(f"{self.URL}{self.passeport.id}/", {"nom": "Piraté"}, format="json")

        self.assertEqual(reponse.status_code, 404)
        self.passeport.refresh_from_db()
        self.assertEqual(self.passeport.nom, "Passeport")

    def test_une_demarche_suspendue_n_est_plus_proposee_aux_citoyens(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        reponse = self.client.patch(f"{self.URL}{self.carte.id}/", {"actif": False}, format="json")

        self.assertEqual(reponse.status_code, 200)
        self.client.credentials()
        noms_citoyens = {d["nom"] for d in self.client.get("/api/citoyens/demarches/").json()}
        self.assertNotIn("Carte d'identité", noms_citoyens)

    def test_la_suppression_d_une_demarche_est_impossible(self):
        # Supprimer une démarche effacerait en cascade ses créneaux et ses rendez-vous.
        self.se_connecter_en_tant_que(self.agent_mairie)

        reponse = self.client.delete(f"{self.URL}{self.carte.id}/")

        self.assertEqual(reponse.status_code, 405)
        self.assertTrue(Demarche.objects.filter(id=self.carte.id).exists())

    def test_le_nom_est_obligatoire(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        reponse = self.client.post(self.URL, {"nom": "", "duree_minutes": 30}, format="json")

        self.assertEqual(reponse.status_code, 400)
        self.assertIn("nom", reponse.json())

    def test_la_duree_doit_rester_raisonnable(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        for duree in (0, 4, 241):
            with self.subTest(duree=duree):
                reponse = self.client.post(self.URL, {"nom": f"Démarche {duree}", "duree_minutes": duree}, format="json")
                self.assertEqual(reponse.status_code, 400)
                self.assertIn("duree_minutes", reponse.json())

    def test_les_durees_limites_sont_acceptees(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        for duree in (5, 240):
            with self.subTest(duree=duree):
                reponse = self.client.post(self.URL, {"nom": f"Démarche {duree}", "duree_minutes": duree}, format="json")
                self.assertEqual(reponse.status_code, 201)

    def test_une_demarche_ne_peut_pas_changer_d_administration(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        self.client.patch(f"{self.URL}{self.carte.id}/", {"administration": self.prefecture.id}, format="json")

        self.carte.refresh_from_db()
        self.assertEqual(self.carte.administration, self.mairie)

    def test_deux_demarches_ne_peuvent_pas_porter_le_meme_nom(self):
        # Sinon on ne les distingue plus, ni dans la liste ni dans les exports.
        self.se_connecter_en_tant_que(self.agent_mairie)

        for nom in ("Carte d'identité", "  carte d'IDENTITÉ "):
            with self.subTest(nom=nom):
                reponse = self.client.post(self.URL, {"nom": nom, "duree_minutes": 30}, format="json")
                self.assertEqual(reponse.status_code, 400)
                self.assertIn("nom", reponse.json())

    def test_le_meme_nom_reste_possible_dans_une_autre_administration(self):
        self.se_connecter_en_tant_que(self.agent_prefecture)

        reponse = self.client.post(self.URL, {"nom": "Carte d'identité", "duree_minutes": 30}, format="json")

        self.assertEqual(reponse.status_code, 201)

    def test_modifier_une_demarche_sans_changer_son_nom_reste_possible(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        reponse = self.client.patch(f"{self.URL}{self.carte.id}/", {"nom": "Carte d'identité", "duree_minutes": 35}, format="json")

        self.assertEqual(reponse.status_code, 200)

    def test_le_nom_est_enregistre_sans_espaces_autour(self):
        self.se_connecter_en_tant_que(self.agent_mairie)

        self.client.post(self.URL, {"nom": "  Certificat de résidence  ", "duree_minutes": 20}, format="json")

        self.assertTrue(Demarche.objects.filter(nom="Certificat de résidence").exists())

    def test_il_faut_etre_connecte(self):
        reponse = self.client.get(self.URL)

        self.assertEqual(reponse.status_code, 401)


class AccesReserveAuxAgentsTests(EspaceAgentTestCase):
    def test_un_compte_sans_fiche_agent_est_refuse_sans_erreur_serveur(self):
        # Avant : le tableau de bord renvoyait une erreur 500 pour un superuser.
        superuser = User.objects.create_superuser(username="admin", password="motdepasse123")
        self.se_connecter_en_tant_que(superuser)

        for url in ("/api/agents/rendez-vous/", "/api/agents/demarches/"):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 403)

    def test_un_agent_desactive_est_refuse_sur_toutes_les_actions(self):
        creneau = Creneau.objects.create(demarche=self.carte, date=datetime.date(2030, 1, 15), heure=datetime.time(9, 0))
        rdv = RendezVous.objects.create(creneau=creneau, nom="Test", prenom="Ama", email="ama@exemple.cg",
                                        telephone="060000000", cle_idempotence="essai-agent-inactif")
        agent_inactif = self.creer_agent("ancien_agent", self.mairie, actif=False)
        self.se_connecter_en_tant_que(agent_inactif)

        requetes = [
            ("get", "/api/agents/moi/"),
            ("get", "/api/agents/rendez-vous/"),
            ("post", f"/api/agents/rendez-vous/{rdv.id}/confirmer/"),
            ("post", f"/api/agents/rendez-vous/{rdv.id}/annuler/"),
            ("get", "/api/agents/demarches/"),
            ("patch", f"/api/agents/demarches/{self.carte.id}/"),
        ]
        for methode, url in requetes:
            with self.subTest(methode=methode, url=url):
                self.assertEqual(getattr(self.client, methode)(url, {}, format="json").status_code, 403)
        rdv.refresh_from_db()
        self.assertEqual(rdv.statut, "en_attente")

    def test_un_agent_desactive_ne_peut_plus_se_connecter(self):
        self.creer_agent("ancien_agent", self.mairie, actif=False)

        reponse = self.client.post("/api/agents/connexion/", {"username": "ancien_agent", "password": "motdepasse123"}, format="json")

        self.assertEqual(reponse.status_code, 403)
        self.assertNotIn("token", reponse.json())

    def test_la_connexion_est_refusee_aux_comptes_sans_fiche_agent(self):
        User.objects.create_superuser(username="admin", password="motdepasse123")

        reponse = self.client.post("/api/agents/connexion/", {"username": "admin", "password": "motdepasse123"}, format="json")

        self.assertEqual(reponse.status_code, 403)
        self.assertNotIn("token", reponse.json())
        self.assertIn("espace agent", reponse.json()["detail"])

    def test_la_connexion_d_un_agent_actif_fonctionne_toujours(self):
        reponse = self.client.post("/api/agents/connexion/", {"username": "agent_mairie", "password": "motdepasse123"}, format="json")

        self.assertEqual(reponse.status_code, 200)
        self.assertIn("token", reponse.json())


class ProfilAgentTests(EspaceAgentTestCase):
    URL = "/api/agents/moi/"

    def test_l_agent_connait_son_administration(self):
        self.agent_mairie.first_name, self.agent_mairie.last_name = "Ama", "Nkounkou"
        self.agent_mairie.save()
        self.mairie.adresse = "Avenue Amilcar Cabral"
        self.mairie.save()
        self.se_connecter_en_tant_que(self.agent_mairie)

        reponse = self.client.get(self.URL)

        self.assertEqual(reponse.status_code, 200)
        self.assertEqual(reponse.json(), {
            "nom": "Ama Nkounkou",
            "administration": {
                "id": self.mairie.id,
                "nom": "Mairie de Brazzaville",
                "ville": "Brazzaville",
                "adresse": "Avenue Amilcar Cabral",
            },
        })

    def test_sans_nom_complet_on_affiche_l_identifiant(self):
        self.se_connecter_en_tant_que(self.agent_prefecture)

        reponse = self.client.get(self.URL)

        self.assertEqual(reponse.json()["nom"], "agent_prefecture")
        self.assertEqual(reponse.json()["administration"]["nom"], "Préfecture du Pool")

    def test_le_profil_est_reserve_aux_agents(self):
        superuser = User.objects.create_superuser(username="admin", password="motdepasse123")
        self.se_connecter_en_tant_que(superuser)

        self.assertEqual(self.client.get(self.URL).status_code, 403)


class RendezVousAgentTests(EspaceAgentTestCase):
    def test_chaque_rendez_vous_indique_l_identifiant_de_sa_demarche(self):
        # Les exports se font démarche par démarche : le nom ne suffit pas à les distinguer.
        creneau = Creneau.objects.create(demarche=self.carte, date=datetime.date(2030, 1, 15), heure=datetime.time(9, 0))
        RendezVous.objects.create(creneau=creneau, nom="Test", prenom="Ama", email="ama@exemple.cg",
                                  telephone="060000000", cle_idempotence="essai-id-demarche")
        self.se_connecter_en_tant_que(self.agent_mairie)

        rdv = self.client.get("/api/agents/rendez-vous/").json()[0]

        self.assertEqual(rdv["demarche_id"], self.carte.id)
        self.assertEqual(rdv["demarche"], "Carte d'identité")
