import datetime

from rest_framework.test import APITestCase

from .models import Administration, Creneau, Demarche, RendezVous


class DemarcheSuspendueTests(APITestCase):
    """Une démarche suspendue par un agent ne doit plus pouvoir être réservée,
    même par un citoyen qui a gardé le lien de la page de réservation."""

    def setUp(self):
        self.mairie = Administration.objects.create(nom="Mairie de Brazzaville", ville="Brazzaville")
        self.carte = Demarche.objects.create(administration=self.mairie, nom="Carte d'identité", actif=False)

    def test_on_ne_peut_plus_bloquer_un_creneau_d_une_demarche_suspendue(self):
        reponse = self.client.post(
            "/api/citoyens/creneaux/reserver/",
            {"demarche": self.carte.id, "date_heure": "2030-01-15T09:00:00"},
            format="json",
        )

        self.assertEqual(reponse.status_code, 404)
        self.assertIn("plus proposée", reponse.json()["detail"])
        self.assertFalse(Creneau.objects.exists())

    def test_on_ne_peut_plus_prendre_rendez_vous_sur_une_demarche_suspendue(self):
        # Créneau bloqué avant la suspension : le formulaire était déjà ouvert.
        creneau = Creneau.objects.create(demarche=self.carte, date=datetime.date(2030, 1, 15), heure=datetime.time(9, 0), disponible=False)

        reponse = self.client.post(
            "/api/citoyens/rendez-vous/",
            {"creneau": creneau.id, "nom": "Moukala", "prenom": "Grâce", "email": "grace@exemple.cg",
             "telephone": "060000001", "cle_idempotence": "essai-suspendue"},
            format="json",
        )

        self.assertEqual(reponse.status_code, 409)
        self.assertIn("plus proposée", reponse.json()["detail"])
        self.assertFalse(RendezVous.objects.exists())

    def test_une_demarche_active_reste_reservable(self):
        self.carte.actif = True
        self.carte.save()

        reponse = self.client.post(
            "/api/citoyens/creneaux/reserver/",
            {"demarche": self.carte.id, "date_heure": "2030-01-15T09:00:00"},
            format="json",
        )

        self.assertEqual(reponse.status_code, 201)
