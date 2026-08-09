from django.shortcuts import render
from rest_framework import generics, status
from .models import Administration, Demarche, Creneau, RendezVous
from .serializers import AdministrationSerializer, DemarcheSerializer, CreneauSerializer,  RendezVousSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db import transaction, IntegrityError
import uuid
from django.core.mail import send_mail

class AdministrationListView(generics.ListAPIView):
    queryset = Administration.objects.filter(actif=True)
    serializer_class = AdministrationSerializer


class DemarcheListView(generics.ListAPIView):
    queryset = Demarche.objects.filter(actif=True)
    serializer_class = DemarcheSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        administration_id = self.request.query_params.get('administration')
        if administration_id:
            queryset = queryset.filter(administration_id=administration_id)
        return queryset


class CreneauListView(generics.ListAPIView):
    serializer_class = CreneauSerializer

    def get_queryset(self):
        demarche_id = self.request.query_params.get('demarche')
        queryset = Creneau.objects.all()
        if demarche_id:
            queryset = queryset.filter(demarche_id=demarche_id)
        queryset = [c for c in queryset if c.disponible or not c.est_verrouille()]
        return queryset


class ReserverCreneauView(APIView):
    def post(self, request, pk):
        with transaction.atomic():
            try:
                creneau = Creneau.objects.select_for_update().get(pk=pk)
            except Creneau.DoesNotExist:
                return Response({'detail': 'Créneau introuvable.'}, status=status.HTTP_404_NOT_FOUND)

            if not creneau.disponible and creneau.est_verrouille():
                return Response({'detail': 'Ce créneau est déjà réservé.'}, status=status.HTTP_409_CONFLICT)

            creneau.verrouiller()

        serializer = CreneauSerializer(creneau)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreerRendezVousView(APIView):
    def post(self, request):
        cle = request.data.get('cle_idempotence')

        if cle and RendezVous.objects.filter(cle_idempotence=cle).exists():
            existant = RendezVous.objects.get(cle_idempotence=cle)
            serializer = RendezVousSerializer(existant)
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = RendezVousSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                creneau = Creneau.objects.select_for_update().get(pk=serializer.validated_data['creneau'].id)
                rendez_vous = serializer.save()
                creneau.disponible = False
                creneau.reserve_jusqu_a = None
                creneau.save()
            return Response(RendezVousSerializer(rendez_vous).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class CreneauxPrisView(APIView):
    def get(self, request):
        demarche_id = request.query_params.get("demarche")
        if not demarche_id:
            return Response({"detail": "Paramètre 'demarche' requis."}, status=status.HTTP_400_BAD_REQUEST)

        creneaux = Creneau.objects.filter(demarche_id=demarche_id, disponible=False)
        pris = []
        for c in creneaux:
            a_un_rdv = hasattr(c, "rendez_vous")
            if a_un_rdv or c.est_verrouille():
                pris.append(f"{c.date.isoformat()}T{c.heure.isoformat()}")
            else:
                c.liberer()

        return Response(pris)


class ReserverCreneauView(APIView):
    """Verrouille un créneau 10 min (pas encore un vrai rendez-vous)."""

    def post(self, request):
        demarche_id = request.data.get("demarche")
        date_heure_str = request.data.get("date_heure")

        if not demarche_id or not date_heure_str:
            return Response({"detail": "Champs 'demarche' et 'date_heure' requis."}, status=status.HTTP_400_BAD_REQUEST)

        date_heure = parse_datetime(date_heure_str)
        if date_heure is None:
            return Response({"detail": "Format de date_heure invalide."}, status=status.HTTP_400_BAD_REQUEST)
        if timezone.is_naive(date_heure):
            date_heure = timezone.make_aware(date_heure)

        try:
            demarche = Demarche.objects.get(id=demarche_id)
        except Demarche.DoesNotExist:
            return Response({"detail": "Démarche introuvable."}, status=status.HTTP_404_NOT_FOUND)

        try:
            with transaction.atomic():
                creneau, cree = Creneau.objects.select_for_update().get_or_create(
                    demarche=demarche,
                    date=date_heure.date(),
                    heure=date_heure.time(),
                )
                if not cree and (hasattr(creneau, "rendez_vous") or creneau.est_verrouille()):
                    return Response({"detail": "Ce créneau vient d'être pris."}, status=status.HTTP_409_CONFLICT)

                creneau.verrouiller()  # disponible=False + verrou 10 min
        except IntegrityError:
            return Response({"detail": "Ce créneau vient d'être pris."}, status=status.HTTP_409_CONFLICT)

        return Response(
            {"id": creneau.id, "date": creneau.date.isoformat(), "heure": creneau.heure.isoformat()},
            status=status.HTTP_201_CREATED,
        )


class CreneauDetailView(APIView):
    def get(self, request, pk):
        try:
            creneau = Creneau.objects.select_related("demarche", "demarche__administration").get(id=pk)
        except Creneau.DoesNotExist:
            return Response({"detail": "Créneau introuvable."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "id": creneau.id,
            "date": creneau.date.isoformat(),
            "heure": creneau.heure.isoformat(),
            "demarche": creneau.demarche.nom,
            "administration": creneau.demarche.administration.nom,
        })


class CreerRendezVousView(APIView):
    def post(self, request):
        creneau_id = request.data.get("creneau")
        nom = request.data.get("nom")
        prenom = request.data.get("prenom")
        email = request.data.get("email")
        telephone = request.data.get("telephone")
        cle_idempotence = request.data.get("cle_idempotence")

        if not all([creneau_id, nom, prenom, email, telephone, cle_idempotence]):
            return Response({"detail": "Champs manquants."}, status=status.HTTP_400_BAD_REQUEST)

        existant = RendezVous.objects.filter(cle_idempotence=cle_idempotence).first()
        if existant:
            return Response({"id": existant.id}, status=status.HTTP_200_OK)

        try:
            creneau = Creneau.objects.get(id=creneau_id)
        except Creneau.DoesNotExist:
            return Response({"detail": "Créneau introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(creneau, "rendez_vous"):
            return Response({"detail": "Ce créneau est déjà pris."}, status=status.HTTP_409_CONFLICT)

        with transaction.atomic():
            rdv = RendezVous.objects.create(
                creneau=creneau,
                nom=nom,
                prenom=prenom,
                email=email,
                telephone=telephone,
                cle_idempotence=cle_idempotence,
            )

        try:
            send_mail(
                subject="Votre rendez-vous est en attente de confirmation",
                message=f"Bonjour {prenom},\n\nVotre demande de rendez-vous pour \"{creneau.demarche.nom}\" auprès de {creneau.demarche.administration.nom} a bien été enregistrée pour le {creneau.date} à {creneau.heure}.\n\nElle est actuellement en attente de confirmation par un agent. Vous recevrez un second email dès que votre rendez-vous sera confirmé.\n\nMerci.",
                from_email=None,
                recipient_list=[email],
            )
        except Exception as erreur:
            print(f"Échec envoi email en attente : {erreur}")

        return Response({"id": rdv.id}, status=status.HTTP_201_CREATED)
    
# Create your views here.
