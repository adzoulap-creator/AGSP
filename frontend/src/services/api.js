const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function getAdministrations() {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/administrations/`, { cache: "no-store" });
  if (!reponse.ok) {
    throw new Error("Erreur lors du chargement des administrations");
  }
  return reponse.json();
}

export async function getDemarches(administrationId) {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/demarches/?administration=${administrationId}`, { cache: "no-store" });
  if (!reponse.ok) {
    throw new Error("Erreur lors du chargement des démarches");
  }
  return reponse.json();
}

export async function getToutesDemarches() {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/demarches/`, { cache: "no-store" });
  if (!reponse.ok) {
    throw new Error("Erreur lors du chargement des démarches");
  }
  return reponse.json();
}

export async function getCreneauxPris(demarcheId) {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/creneaux/pris/?demarche=${demarcheId}`, { cache: "no-store" });
  if (!reponse.ok) throw new Error("Erreur lors du chargement des créneaux");
  return reponse.json();
}

export async function reserverCreneau(demarcheId, dateHeureISO) {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/creneaux/reserver/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ demarche: demarcheId, date_heure: dateHeureISO }),
    cache: "no-store",
  });
  if (reponse.status === 409) throw new Error("Ce créneau vient d'être pris, choisissez-en un autre.");
  if (!reponse.ok) {
    const data = await reponse.json().catch(() => ({}));
    throw new Error(data.detail || "Erreur lors de la réservation du créneau");
  }
  return reponse.json();
}

export async function getCreneauDetail(creneauId) {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/creneaux/${creneauId}/`, { cache: "no-store" });
  if (!reponse.ok) {
    throw new Error("Erreur lors du chargement du créneau");
  }
  return reponse.json();
}

export async function creerRendezVous(payload) {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/rendez-vous/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!reponse.ok) {
    const data = await reponse.json().catch(() => ({}));
    throw new Error(data.detail || "Erreur lors de la création du rendez-vous");
  }
  return reponse.json();
}

export async function connexionAgent(username, password) {
  const reponse = await fetch(`${API_BASE_URL}/agents/connexion/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  if (!reponse.ok) {
    // 401 : mauvais identifiants ; 403 : compte sans accès à l'espace agent.
    const data = await reponse.json().catch(() => ({}));
    throw new Error(data.detail || "Identifiants invalides.");
  }
  return reponse.json();
}

export async function getRendezVousAgent() {
  const token = localStorage.getItem("agentToken");
  const reponse = await fetch(`${API_BASE_URL}/agents/rendez-vous/`, {
    headers: { "Authorization": `Token ${token}` },
    cache: "no-store",
  });
  if (!reponse.ok) throw new Error("Erreur lors du chargement des rendez-vous");
  return reponse.json();
}

export async function confirmerRendezVous(rdvId) {
  const token = localStorage.getItem("agentToken");
  const reponse = await fetch(`${API_BASE_URL}/agents/rendez-vous/${rdvId}/confirmer/`, {
    method: "POST",
    headers: { "Authorization": `Token ${token}` },
    cache: "no-store",
  });
  if (!reponse.ok) throw new Error("Erreur lors de la confirmation");
  return reponse.json();
}

export async function annulerRendezVous(rdvId) {
  const token = localStorage.getItem("agentToken");
  const reponse = await fetch(`${API_BASE_URL}/agents/rendez-vous/${rdvId}/annuler/`, {
    method: "POST",
    headers: { "Authorization": `Token ${token}` },
    cache: "no-store",
  });
  if (!reponse.ok) throw new Error("Erreur lors de l'annulation");
  return reponse.json();
}

export async function getDemarchesAgent() {
  const token = localStorage.getItem("agentToken");
  const reponse = await fetch(`${API_BASE_URL}/agents/demarches/`, {
    headers: { "Authorization": `Token ${token}` },
    cache: "no-store",
  });
  if (!reponse.ok) throw new Error("Erreur lors du chargement des démarches");
  return reponse.json();
}

// En cas de refus, les erreurs de validation renvoyées par l'API
// (par exemple { nom: ["Le nom de la démarche est obligatoire."] })
// sont gardées dans erreur.champs pour être affichées sous chaque champ.
async function envoyerDemarche(url, methode, donnees) {
  const token = localStorage.getItem("agentToken");
  const reponse = await fetch(url, {
    method: methode,
    headers: { "Content-Type": "application/json", "Authorization": `Token ${token}` },
    body: JSON.stringify(donnees),
    cache: "no-store",
  });
  const data = await reponse.json().catch(() => ({}));
  if (!reponse.ok) {
    const erreur = new Error(data.detail || "La démarche n'a pas pu être enregistrée. Réessayez dans un instant.");
    if (reponse.status === 400) erreur.champs = data;
    throw erreur;
  }
  return data;
}

export function creerDemarcheAgent(donnees) {
  return envoyerDemarche(`${API_BASE_URL}/agents/demarches/`, "POST", donnees);
}

export function modifierDemarcheAgent(demarcheId, donnees) {
  return envoyerDemarche(`${API_BASE_URL}/agents/demarches/${demarcheId}/`, "PATCH", donnees);
}

// Nom de l'agent connecté et administration (le service public) pour laquelle il travaille.
export async function getProfilAgent() {
  const token = localStorage.getItem("agentToken");
  const reponse = await fetch(`${API_BASE_URL}/agents/moi/`, {
    headers: { "Authorization": `Token ${token}` },
    cache: "no-store",
  });
  if (!reponse.ok) throw new Error("Erreur lors du chargement du profil");
  return reponse.json();
}
