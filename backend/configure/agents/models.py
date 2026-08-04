from django.db import models
from django.contrib.auth.models import User


class Agent(models.Model):
    utilisateur = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent')
    administration = models.ForeignKey('citoyens.Administration', on_delete=models.CASCADE, related_name='agents')
    telephone = models.CharField(max_length=20, blank=True)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.utilisateur.get_full_name() or self.utilisateur.username} - {self.administration.nom}"