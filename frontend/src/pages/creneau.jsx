import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../composent/navBar";
import { getCreneauxPris, reserverCreneau } from "../services/api";

const HEURES_FIXES = ["08:00", "09:30", "10:00", "11:15", "13:00", "14:30", "15:30", "16:15"];

function genererJours() {
  const jours = [];
  let date = new Date();
  while (jours.length < 5) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) { // on saute samedi/dimanche
      jours.push(new Date(date));
    }
  }
  return jours;
}

function ChoixCreneau() {
  const { demarcheId } = useParams();
  const navigate = useNavigate();
  const [jours] = useState(genererJours);
  const [jourActif, setJourActif] = useState(0);
  const [creneauxPris, setCreneauxPris] = useState([]);
  const [heureChoisie, setHeureChoisie] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    getCreneauxPris(demarcheId)
      .then(setCreneauxPris)
      .catch((err) => setErreur(err.message));
  }, [demarcheId]);

  const dateHeureComplete = (heure) => {
    const [h, m] = heure.split(":");
    const d = new Date(jours[jourActif]);
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  };

  const estPris = (heure) => {
    const cible = dateHeureComplete(heure).toISOString();
    return creneauxPris.some((c) => c === cible || new Date(c).getTime() === dateHeureComplete(heure).getTime());
  };

  const continuer = async () => {
    if (!heureChoisie) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const creneau = await reserverCreneau(demarcheId, dateHeureComplete(heureChoisie).toISOString());
      navigate("/formulaire", { state: { creneauId: creneau.id } });
    } catch (err) {
      setErreur(err.message);
      setHeureChoisie(null);
      getCreneauxPris(demarcheId).then(setCreneauxPris);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-jaune/5">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-bold text-vert-dark text-3xl mb-6">Choisissez un créneau</h1>

        <div className="flex gap-3 mb-8">
          {jours.map((jour, i) => (
            <button
              key={i}
              onClick={() => { setJourActif(i); setHeureChoisie(null); }}
              className={
                jourActif === i
                  ? "bg-vert text-white px-4 py-2 rounded-full font-medium"
                  : "bg-white text-gray-600 px-4 py-2 rounded-full border border-gray-200 hover:border-vert"
              }
            >
              {jour.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {HEURES_FIXES.map((heure) => {
            const pris = estPris(heure);
            const selectionne = heureChoisie === heure;
            if (pris) {
              return (
                <button key={heure} disabled className="bg-red-50 text-red-400 px-5 py-2 rounded-full border border-red-200 cursor-not-allowed line-through">
                  {heure}
                </button>
              );
            }
            return (
              <button
                key={heure}
                onClick={() => setHeureChoisie(heure)}
                className={
                  selectionne
                    ? "bg-jaune text-vert-dark font-semibold px-5 py-2 rounded-full"
                    : "bg-white text-gray-700 px-5 py-2 rounded-full border border-gray-200 hover:border-vert"
                }
              >
                {heure}
              </button>
            );
          })}
        </div>

        {erreur && <p className="text-red-500 mt-4">{erreur}</p>}

        {heureChoisie && (
          <div className="mt-10 bg-white rounded-2xl shadow-sm p-6 max-w-sm">
            <p className="text-sm text-gray-400 mb-2">RÉCAPITULATIF</p>
            <p className="font-semibold text-vert-dark">
              {jours[jourActif].toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}, {heureChoisie}
            </p>
            <button
              onClick={continuer}
              disabled={envoi}
              className="mt-4 bg-vert hover:bg-vert-dark text-white px-6 py-2 rounded-full font-medium transition-colors w-full disabled:opacity-50"
            >
              {envoi ? "Réservation..." : "Continuer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChoixCreneau;