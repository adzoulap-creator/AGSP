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