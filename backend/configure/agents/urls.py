from .views import ConnexionAgentView, RendezVousAgentListView, ConfirmerRendezVousView, AnnulerRendezVousView
from django.urls import path

urlpatterns = [
    path("connexion/", ConnexionAgentView.as_view()),
    path("rendez-vous/", RendezVousAgentListView.as_view()),
    path("rendez-vous/<int:rdv_id>/confirmer/", ConfirmerRendezVousView.as_view()),
    path("rendez-vous/<int:rdv_id>/annuler/", AnnulerRendezVousView.as_view()),
]

