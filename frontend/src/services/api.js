const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function getAdministrations() {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/administrations/`);
  if (!reponse.ok) {
    throw new Error("Erreur lors du chargement des administrations");
  }
  return reponse.json();
}

export async function getDemarches(administrationId) {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/demarches/?administration=${administrationId}`);
  if (!reponse.ok) {
    throw new Error("Erreur lors du chargement des démarches");
  }
  return reponse.json();
}

export async function getCreneauxPris(demarcheId) {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/creneaux/pris/?demarche=${demarcheId}`);
  if (!reponse.ok) throw new Error("Erreur lors du chargement des créneaux");
  return reponse.json();
}

export async function reserverCreneau(demarcheId, dateHeureISO) {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/creneaux/reserver/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ demarche: demarcheId, date_heure: dateHeureISO }),
  });
  if (reponse.status === 409) throw new Error("Ce créneau vient d'être pris, choisissez-en un autre.");
  if (!reponse.ok) throw new Error("Erreur lors de la réservation du créneau");
  return reponse.json();
}

export async function getCreneauDetail(creneauId) {
  const reponse = await fetch(`${API_BASE_URL}/citoyens/creneaux/${creneauId}/`);
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
  });
  if (!reponse.ok) {
    throw new Error("Identifiants invalides.");
  }
  return reponse.json();
}

export async function getRendezVousAgent() {
  const token = localStorage.getItem("agentToken");
  const reponse = await fetch(`${API_BASE_URL}/agents/rendez-vous/`, {
    headers: { "Authorization": `Token ${token}` },
  });
  if (!reponse.ok) throw new Error("Erreur lors du chargement des rendez-vous");
  return reponse.json();
}

export async function confirmerRendezVous(rdvId) {
  const token = localStorage.getItem("agentToken");
  const reponse = await fetch(`${API_BASE_URL}/agents/rendez-vous/${rdvId}/confirmer/`, {
    method: "POST",
    headers: { "Authorization": `Token ${token}` },
  });
  if (!reponse.ok) throw new Error("Erreur lors de la confirmation");
  return reponse.json();
}

export async function annulerRendezVous(rdvId) {
  const token = localStorage.getItem("agentToken");
  const reponse = await fetch(`${API_BASE_URL}/agents/rendez-vous/${rdvId}/annuler/`, {
    method: "POST",
    headers: { "Authorization": `Token ${token}` },
  });
  if (!reponse.ok) throw new Error("Erreur lors de l'annulation");
  return reponse.json();
}