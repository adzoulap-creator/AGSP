from rest_framework import serializers
from citoyens.models import RendezVous


class RendezVousAgentSerializer(serializers.ModelSerializer):
    demarche = serializers.CharField(source='creneau.demarche.nom')
    date = serializers.DateField(source='creneau.date')
    heure = serializers.TimeField(source='creneau.heure')

    class Meta:
        model = RendezVous
        fields = ['id', 'nom', 'prenom', 'email', 'telephone', 'statut', 'demarche', 'date', 'heure']