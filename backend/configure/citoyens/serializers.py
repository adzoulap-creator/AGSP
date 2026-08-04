from rest_framework import serializers
from .models import Administration, Demarche, Creneau, RendezVous



class AdministrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administration
        fields = ['id', 'nom', 'description', 'adresse', 'ville', 'actif']


class DemarcheSerializer(serializers.ModelSerializer):
    class Meta:
        model = Demarche
        fields = ['id', 'administration', 'nom', 'description', 'duree_minutes', 'actif']
        

class CreneauSerializer(serializers.ModelSerializer):
    class Meta:
        model = Creneau
        fields = ['id', 'demarche', 'date', 'heure', 'disponible']


class RendezVousSerializer(serializers.ModelSerializer):
    class Meta:
        model = RendezVous
        fields = ['id', 'creneau', 'nom', 'prenom', 'email', 'telephone', 'statut', 'cle_idempotence', 'cree_le']
        read_only_fields = ['statut', 'cree_le']