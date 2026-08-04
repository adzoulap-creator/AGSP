from django.contrib import admin
from .models import Administration, Demarche, Creneau, RendezVous

admin.site.register(Administration)
admin.site.register(Demarche)
admin.site.register(Creneau)
admin.site.register(RendezVous)