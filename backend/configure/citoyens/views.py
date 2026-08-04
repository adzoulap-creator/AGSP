from django.shortcuts import render
from rest_framework import generics, status
from .models import Administration, Demarche, Creneau, RendezVous
from .serializers import AdministrationSerializer, DemarcheSerializer, CreneauSerializer,  RendezVousSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone



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
    
# Create your views here.
