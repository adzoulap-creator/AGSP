from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from citoyens.models import RendezVous
from .serializers import RendezVousAgentSerializer
from django.core.mail import send_mail
from rest_framework.generics import get_object_or_404




class ConnexionAgentView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        utilisateur = authenticate(username=username, password=password)
        if utilisateur is None:
            return Response({"detail": "Identifiants invalides."}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=utilisateur)
        return Response({"token": token.key, "nom": utilisateur.get_full_name() or utilisateur.username})
    

class RendezVousAgentListView(ListAPIView):
    serializer_class = RendezVousAgentSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def post(self, request, rdv_id):
        agent = request.user.agent
        rdv = get_object_or_404(
            RendezVous,
            id=rdv_id,
            creneau__demarche__administration=agent.administration
        )
        rdv.statut = 'valide'
        rdv.save()

        send_mail(
            subject="Votre rendez-vous a été confirmé",
            message=f"Bonjour {rdv.prenom},\n\nVotre rendez-vous pour \"{rdv.creneau.demarche.nom}\" auprès de {agent.administration.nom} a été CONFIRMÉ, le {rdv.creneau.date} à {rdv.creneau.heure}.\n\nMerci.",
            from_email=None,
            recipient_list=[rdv.email],
        )
        return Response({"detail": "Rendez-vous confirmé."})


class AnnulerRendezVousView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, rdv_id):
        agent = request.user.agent
        rdv = get_object_or_404(
            RendezVous,
            id=rdv_id,
            creneau__demarche__administration=agent.administration
        )
        rdv.statut = 'refuse'
        rdv.save()

        send_mail(
            subject="Votre rendez-vous a été annulé",
            message=f"Bonjour {rdv.prenom},\n\nVotre rendez-vous pour \"{rdv.creneau.demarche.nom}\" auprès de {agent.administration.nom} a été ANNULÉ, initialement prévu le {rdv.creneau.date} à {rdv.creneau.heure}.\n\nMerci.",
            from_email=None,
            recipient_list=[rdv.email],
        )
        return Response({"detail": "Rendez-vous annulé."})
    
# Create your views here.
