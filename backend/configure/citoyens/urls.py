from django.urls import path
from .views import (
    AdministrationListView, DemarcheListView,
    CreneauListView, ReserverCreneauView, CreerRendezVousView,
   CreneauxPrisView,CreneauDetailView, CreerRendezVousView
)


urlpatterns = [
    path("creneaux/pris/", CreneauxPrisView.as_view()),
    path("creneaux/reserver/", ReserverCreneauView.as_view()),
    path('administrations/', AdministrationListView.as_view(), name='administration-list'),
    path('demarches/', DemarcheListView.as_view(), name='demarche-list'),
    path('creneaux/', CreneauListView.as_view(), name='creneau-list'),
    path('creneaux/<int:pk>/reserver/', ReserverCreneauView.as_view(), name='creneau-reserver'),
    path('rendezvous/', CreerRendezVousView.as_view(), name='rendezvous-create'),
    path("creneaux/<int:pk>/", CreneauDetailView.as_view()),
    path("rendez-vous/", CreerRendezVousView.as_view()),
]