# AGSP — Application de Gestion des Services Publics

Plateforme de prise de rendez-vous avec les administrations. Un citoyen choisit une
administration, une démarche, un créneau, puis remplit ses coordonnées. Un agent de
l'administration se connecte à son tableau de bord pour confirmer ou annuler les
demandes ; le citoyen est prévenu par email à chaque étape.

- `backend/configure` : API Django 5.2 + Django REST Framework (apps `citoyens` et `agents`)
- `frontend` : React 19 + Vite + Tailwind CSS

## Prérequis

- Python 3.10 ou plus récent (testé avec 3.13)
- Node.js 20.19+ ou 22.13+ (testé avec Node 24)

## Installation du backend

```bash
cd backend/configure
python -m venv myenv
myenv\Scripts\activate          # Windows
# source myenv/bin/activate     # Linux / macOS
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

L'API est alors disponible sur http://127.0.0.1:8000/api/ et l'administration Django
sur http://127.0.0.1:8000/admin/.

### Emails

La configuration d'envoi se met dans `backend/configure/.env` (modèle :
`backend/configure/.env.example`) :

- sans `.env`, rien ne bloque : les emails sont affichés dans le terminal du serveur ;
- avec seulement `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD`, l'envoi passe par Gmail
  (il faut un mot de passe d'application Google de 16 caractères) ;
- pour un autre serveur (celui de l'école par exemple), renseigner aussi `EMAIL_HOST`,
  `EMAIL_PORT` et `EMAIL_USE_TLS`.

`DEFAULT_FROM_EMAIL` doit être la même adresse que `EMAIL_HOST_USER`, sinon le serveur
refuse l'envoi (`553 Sender address rejected`).

## Installation du frontend

```bash
cd frontend
npm install
npm run dev
```

Le site est disponible sur http://localhost:5173. Par défaut il appelle l'API sur
`http://127.0.0.1:8000/api` ; pour changer d'adresse, voir `frontend/.env.example`.

## Premières données

La base est vide après l'installation. Depuis http://127.0.0.1:8000/admin/ :

1. créer une **Administration**, puis une ou plusieurs **Démarches** rattachées ;
2. pour tester l'espace agent : créer un **Utilisateur**, puis un **Agent** qui le relie
   à l'administration. Un compte sans fiche Agent (le superuser par exemple) ne peut
   pas utiliser le tableau de bord.

## Routes de l'API

| Méthode | URL | Rôle |
|---|---|---|
| GET | `/api/citoyens/administrations/` | administrations actives |
| GET | `/api/citoyens/demarches/?administration=<id>` | démarches d'une administration |
| GET | `/api/citoyens/creneaux/pris/?demarche=<id>` | créneaux déjà pris ou bloqués |
| POST | `/api/citoyens/creneaux/reserver/` | bloque un créneau 10 minutes |
| GET | `/api/citoyens/creneaux/<id>/` | détail d'un créneau |
| POST | `/api/citoyens/rendez-vous/` | crée le rendez-vous |
| POST | `/api/agents/connexion/` | connexion agent, renvoie un token |
| GET | `/api/agents/rendez-vous/` | rendez-vous de l'administration de l'agent |
| POST | `/api/agents/rendez-vous/<id>/confirmer/` | confirme et prévient le citoyen |
| POST | `/api/agents/rendez-vous/<id>/annuler/` | annule et prévient le citoyen |
