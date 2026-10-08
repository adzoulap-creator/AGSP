from rest_framework import serializers
from citoyens.models import Demarche, RendezVous


class RendezVousAgentSerializer(serializers.ModelSerializer):
    demarche = serializers.CharField(source='creneau.demarche.nom')
    # L'identifiant permet de distinguer deux démarches dans les exports.
    demarche_id = serializers.IntegerField(source='creneau.demarche_id', read_only=True)
    date = serializers.DateField(source='creneau.date')
    heure = serializers.TimeField(source='creneau.heure')

    class Meta:
        model = RendezVous
        fields = ['id', 'nom', 'prenom', 'email', 'telephone', 'statut', 'demarche', 'demarche_id', 'date', 'heure']


class DemarcheAgentSerializer(serializers.ModelSerializer):
    """Démarche telle que l'agent la gère. L'administration n'est jamais
    modifiable ici : c'est toujours celle de l'agent connecté."""

    duree_minutes = serializers.IntegerField(
        min_value=5,
        max_value=240,
        required=False,
        error_messages={
            "min_value": "La durée doit être d'au moins 5 minutes.",
            "max_value": "La durée ne peut pas dépasser 240 minutes (4 heures).",
            "invalid": "Indiquez une durée en minutes.",
        },
    )

    class Meta:
        model = Demarche
        fields = ["id", "nom", "description", "duree_minutes", "actif"]
        extra_kwargs = {
            "nom": {
                "error_messages": {
                    "blank": "Le nom de la démarche est obligatoire.",
                    "required": "Le nom de la démarche est obligatoire.",
                    "max_length": "Le nom ne doit pas dépasser 100 caractères.",
                }
            },
        }

    def validate_nom(self, valeur):
        # Deux démarches du même nom dans une administration seraient impossibles
        # à distinguer pour les citoyens comme dans les exports.
        nom = valeur.strip()
        administration = self.context["request"].user.agent.administration
        autres = Demarche.objects.filter(administration=administration)
        if self.instance is not None:
            autres = autres.exclude(pk=self.instance.pk)
        if any(existant.strip().casefold() == nom.casefold() for existant in autres.values_list("nom", flat=True)):
            raise serializers.ValidationError("Une démarche porte déjà ce nom dans votre administration.")
        return nom
