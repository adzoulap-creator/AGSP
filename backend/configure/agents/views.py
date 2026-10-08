from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, ListCreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from citoyens.models import Demarche, RendezVous
from .permissions import EstAgentActif, est_agent_actif
from .serializers import DemarcheAgentSerializer, RendezVousAgentSerializer
from django.core.mail import send_mail
from rest_framework.generics import get_object_or_404




class ConnexionAgentView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        utilisateur = authenticate(username=username, password=password)
        if utilisateur is None:
            return Response({"detail": "Identifiants invalides."}, status=status.HTTP_401_UNAUTHORIZED)

        # Un compte Django sans fiche Agent active (un superuser par exemple)
        # n'a rien à faire dans l'espace agent : on ne lui donne pas de jeton.
        if not est_agent_actif(utilisateur):
            return Response({"detail": EstAgentActif.message}, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=utilisateur)
        return Response({"token": token.key, "nom": utilisateur.get_full_name() or utilisateur.username})
    

class ProfilAgentView(APIView):
    """Qui est connecté et pour quelle administration : l'espace agent
    affiche le nom de cette administration en premier."""

    permission_classes = [IsAuthenticated, EstAgentActif]

    def get(self, request):
        utilisateur = request.user
        administration = utilisateur.agent.administration
        return Response({
            "nom": utilisateur.get_full_name() or utilisateur.username,
            "administration": {
                "id": administration.id,
                "nom": administration.nom,
                "ville": administration.ville,
                "adresse": administration.adresse,
            },
        })


class RendezVousAgentListView(ListAPIView):
    serializer_class = RendezVousAgentSerializer
    permission_classes = [IsAuthenticated, EstAgentActif]

    def get_queryset(self):
        agent = self.request.user.agent
        queryset = RendezVous.objects.filter(
            creneau__demarche__administration=agent.administration
        ).order_by('creneau__date', 'creneau__heure')
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        return queryset
    

class ConfirmerRendezVousView(APIView):
    permission_classes = [IsAuthenticated, EstAgentActif]

    def post(self, request, rdv_id):
        agent = request.user.agent
        rdv = get_object_or_404(
            RendezVous,
            id=rdv_id,
            creneau__demarche__administration=agent.administration
        )
        rdv.statut = 'valide'
        rdv.save()

        # Le statut est déjà enregistré : si l'email ne part pas, on le note
        # dans les logs mais on ne fait pas échouer la requête de l'agent.
        try:
            send_mail(
                subject="Votre rendez-vous a été confirmé",
                message=f"Bonjour {rdv.prenom},\n\nVotre rendez-vous pour \"{rdv.creneau.demarche.nom}\" auprès de {agent.administration.nom} a été CONFIRMÉ, le {rdv.creneau.date} à {rdv.creneau.heure}.\n\nMerci.",
                from_email=None,
                recipient_list=[rdv.email],
            )
        except Exception as erreur:
            print(f"Échec envoi email de confirmation : {erreur}")
        return Response({"detail": "Rendez-vous confirmé."})


class AnnulerRendezVousView(APIView):
    permission_classes = [IsAuthenticated, EstAgentActif]

    def post(self, request, rdv_id):
        agent = request.user.agent
        rdv = get_object_or_404(
            RendezVous,
            id=rdv_id,
            creneau__demarche__administration=agent.administration
        )
        rdv.statut = 'refuse'
        rdv.save()

        # Le statut est déjà enregistré : si l'email ne part pas, on le note
        # dans les logs mais on ne fait pas échouer la requête de l'agent.
        try:
            send_mail(
                subject="Votre rendez-vous a été annulé",
                message=f"Bonjour {rdv.prenom},\n\nVotre rendez-vous pour \"{rdv.creneau.demarche.nom}\" auprès de {agent.administration.nom} a été ANNULÉ, initialement prévu le {rdv.creneau.date} à {rdv.creneau.heure}.\n\nMerci.",
                from_email=None,
                recipient_list=[rdv.email],
            )
        except Exception as erreur:
            print(f"Échec envoi email d'annulation : {erreur}")
        return Response({"detail": "Rendez-vous annulé."})


class DemarcheAgentListView(ListCreateAPIView):
    """Démarches de l'administration de l'agent, y compris celles suspendues."""

    serializer_class = DemarcheAgentSerializer
    permission_classes = [IsAuthenticated, EstAgentActif]

    def get_queryset(self):
        return Demarche.objects.filter(administration=self.request.user.agent.administration).order_by("nom")

    def perform_create(self, serializer):
        serializer.save(administration=self.request.user.agent.administration)


class DemarcheAgentDetailView(UpdateAPIView):
    """Modification ou suspension (actif=false) d'une démarche.

    Pas de suppression : effacer une démarche supprimerait en cascade ses
    créneaux et ses rendez-vous. On la suspend à la place."""

    serializer_class = DemarcheAgentSerializer
    permission_classes = [IsAuthenticated, EstAgentActif]

    def get_queryset(self):
        return Demarche.objects.filter(administration=self.request.user.agent.administration)

