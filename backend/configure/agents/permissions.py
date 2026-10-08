from rest_framework.permissions import BasePermission


def est_agent_actif(utilisateur):
    """Vrai si le compte a une fiche Agent active (un superuser n'en a pas forcément)."""
    return hasattr(utilisateur, "agent") and utilisateur.agent.actif


class EstAgentActif(BasePermission):
    message = "Ce compte n'a pas accès à l'espace agent."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and est_agent_actif(request.user))
