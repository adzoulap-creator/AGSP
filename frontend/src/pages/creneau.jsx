import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../composent/navBar";
import { getCreneauxPris, reserverCreneau } from "../services/api";

const HEURES_FIXES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const NOMS_MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const NOMS_JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function construireCalendrier(mois, annee) {
  const premierJour = new Date(annee, mois, 1);
  const decalage = (premierJour.getDay() + 6) % 7;
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cases = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let j = 1; j <= nbJours; j++) cases.push(new Date(annee, mois, j));
  return cases;
}

function ChoixCreneau() {
  const { demarcheId } = useParams();
  const navigate = useNavigate();

  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);

  const [mois, setMois] = useState(aujourdHui.getMonth());
  const [annee, setAnnee] = useState(aujourdHui.getFullYear());
  const [jourSelectionne, setJourSelectionne] = useState(null);
  const [heureSelectionnee, setHeureSelectionnee] = useState(null);
  const [creneauxPris, setCreneauxPris] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    getCreneauxPris(demarcheId)
      .then(setCreneauxPris)
      .catch((err) => setErreur(err.message));
  }, [demarcheId]);

  const cases = construireCalendrier(mois, annee);

  const estSelectionnable = (date) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d < aujourdHui) return false;
    if (d.getDay() === 0 || d.getDay() === 6) return false;
    return true;
  };

  const changerMois = (delta) => {
    let m = mois + delta;
    let a = annee;
    if (m < 0) { m = 11; a -= 1; }
    if (m > 11) { m = 0; a += 1; }
    setMois(m);
    setAnnee(a);
  };

  const choisirJour = (date) => {
    setJourSelectionne(date);
    setHeureSelectionnee(null);
  };

  const dateHeureDe = (heure) => {
    const [h, m] = heure.split(":");
    const d = new Date(jourSelectionne);
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  };

  const estPris = (heure) => {
    const cible = dateHeureDe(heure).getTime();
    return creneauxPris.some((c) => new Date(c).getTime() === cible);
  };

  const continuer = async () => {
    if (!heureSelectionnee) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const dh = dateHeureDe(heureSelectionnee);
      const creneau = await reserverCreneau(demarcheId, dh.toISOString());
      navigate("/formulaire", { state: { creneauId: creneau.id } });
    } catch (err) {
      setErreur(err.message);
      setHeureSelectionnee(null);
      getCreneauxPris(demarcheId).then(setCreneauxPris);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-jaune/5">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-bold text-vert-dark text-3xl mb-8">Choisissez un créneau</h1>

        <div className="flex gap-10 items-start">
          <div className="flex-1">

            <div className="flex gap-6 items-start flex-wrap">

              {!jourSelectionne && (
                <div className="bg-white rounded-2xl shadow-sm p-5 w-full max-w-sm">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changerMois(-1)} className="text-gray-400 hover:text-vert px-2">‹</button>
                    <p className="font-semibold text-vert-dark capitalize">{NOMS_MOIS[mois]} {annee}</p>
                    <button onClick={() => changerMois(1)} className="text-gray-400 hover:text-vert px-2">›</button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {NOMS_JOURS.map((j) => (
                      <p key={j} className="text-center text-xs text-gray-400 font-medium">{j}</p>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {cases.map((date, i) => {
                      if (!date) return <div key={i} />;
                      const selectionnable = estSelectionnable(date);
                      const estAujourdHui = date.getTime() === aujourdHui.getTime();
                      const estChoisi = jourSelectionne && date.getTime() === jourSelectionne.getTime();

                      return (
                        <button
                          key={i}
                          disabled={!selectionnable}
                          onClick={() => choisirJour(date)}
                          className={
                            estChoisi
                              ? "aspect-square rounded-full bg-vert text-white text-sm font-semibold"
                              : selectionnable
                              ? `aspect-square rounded-full text-sm hover:bg-jaune/30 ${estAujourdHui ? "border border-vert text-vert-dark font-semibold" : "text-gray-700"}`
                              : "aspect-square rounded-full text-sm text-gray-300 cursor-not-allowed"
                          }
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {jourSelectionne && (
                <div className="bg-white rounded-2xl shadow-sm p-5 w-full max-w-xs">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500 capitalize">
                      {jourSelectionne.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                    <button onClick={() => setJourSelectionne(null)} className="text-xs text-vert hover:underline">
                      Changer
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {HEURES_FIXES.map((heure) => {
                      const pris = estPris(heure);
                      const selectionne = heureSelectionnee === heure;

                      if (pris) {
                        return (
                          <button key={heure} disabled className="bg-red-50 text-red-400 py-2 rounded-full border border-red-200 cursor-not-allowed line-through text-sm">
                            {heure}
                          </button>
                        );
                      }
                      return (
                        <button
                          key={heure}
                          onClick={() => setHeureSelectionnee(heure)}
                          className={
                            selectionne
                              ? "bg-jaune text-vert-dark font-semibold py-2 rounded-full text-sm"
                              : "bg-white text-gray-700 py-2 rounded-full border border-gray-200 hover:border-vert text-sm"
                          }
                        >
                          {heure}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {erreur && <p className="text-red-500 mt-4">{erreur}</p>}
          </div>

          <div className="w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-12">
              <p className="text-sm text-gray-400 mb-3">RÉCAPITULATIF</p>
              {heureSelectionnee ? (
                <>
                  <p className="font-semibold text-vert-dark capitalize">
                    {jourSelectionne.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <p className="text-gray-600">{heureSelectionnee}</p>
                  <button
                    onClick={continuer}
                    disabled={envoi}
                    className="mt-4 bg-vert hover:bg-vert-dark text-white px-6 py-2 rounded-full font-medium transition-colors w-full disabled:opacity-50"
                  >
                    {envoi ? "Réservation..." : "Continuer"}
                  </button>
                </>
              ) : (
                <p className="text-gray-400 text-sm">
                  {jourSelectionne ? "Sélectionnez une heure." : "Sélectionnez d'abord un jour."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChoixCreneau;