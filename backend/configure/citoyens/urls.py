from django.urls import path
from .views import (
    AdministrationListView, DemarcheListView,
    CreneauListView, ReserverCreneauView, CreerRendezVousView
)


urlpatterns = [
    path('administrations/', AdministrationListView.as_view(), name='administration-list'),
    path('demarches/', DemarcheListView.as_view(), name='demarche-list'),
    path('creneaux/', CreneauListView.as_view(), name='creneau-list'),
    path('creneaux/<int:pk>/reserver/', ReserverCreneauView.as_view(), name='creneau-reserver'),
    path('rendezvous/', CreerRendezVousView.as_view(), name='rendezvous-create'),
]