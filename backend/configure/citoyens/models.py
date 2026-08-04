from django.db import models
from django.utils import timezone
from datetime import timedelta

class Administration(models.Model):
    nom = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    ville = models.CharField(max_length=100, blank=True)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return self.nom

class Demarche(models.Model):
    administration = models.ForeignKey(Administration, on_delete=models.CASCADE, related_name='demarches')
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    duree_minutes = models.PositiveIntegerField(default=30)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return self.nom


class Creneau(models.Model):
    demarche = models.ForeignKey(Demarche, on_delete=models.CASCADE, related_name='creneaux')
    date = models.DateField()
    heure = models.TimeField()
    disponible = models.BooleanField(default=True)
    reserve_jusqu_a = models.DateTimeField(null=True, blank=True)

    def est_verrouille(self):
        if self.reserve_jusqu_a is None:
            return False
        return timezone.now() < self.reserve_jusqu_a

    def verrouiller(self, minutes=10):
        self.reserve_jusqu_a = timezone.now() + timedelta(minutes=minutes)
        self.disponible = False
        self.save()

    def liberer(self):
        self.reserve_jusqu_a = None
        self.disponible = True
        self.save()

    class Meta:
        unique_together = ('demarche', 'date', 'heure')

    def __str__(self):
        return f"{self.demarche.nom} - {self.date} {self.heure}"
    
    
class RendezVous(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente de validation'),
        ('valide', 'Validé'),
        ('refuse', 'Refusé'),
    ]

    creneau = models.OneToOneField(Creneau, on_delete=models.CASCADE, related_name='rendez_vous')
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField()
    telephone = models.CharField(max_length=20)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    cle_idempotence = models.CharField(max_length=100, unique=True)
    cree_le = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.creneau}"