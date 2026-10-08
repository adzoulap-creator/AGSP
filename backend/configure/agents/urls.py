from .views import (
    AnnulerRendezVousView, ConfirmerRendezVousView, ConnexionAgentView,
    DemarcheAgentDetailView, DemarcheAgentListView, ProfilAgentView, RendezVousAgentListView,
)
from django.urls import path

urlpatterns = [
    path("connexion/", ConnexionAgentView.as_view()),
    path("moi/", ProfilAgentView.as_view()),
    path("rendez-vous/", RendezVousAgentListView.as_view()),
    path("rendez-vous/<int:rdv_id>/confirmer/", ConfirmerRendezVousView.as_view()),
    path("rendez-vous/<int:rdv_id>/annuler/", AnnulerRendezVousView.as_view()),
    path("demarches/", DemarcheAgentListView.as_view()),
    path("demarches/<int:pk>/", DemarcheAgentDetailView.as_view()),
]

