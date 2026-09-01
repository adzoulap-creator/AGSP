import { useEffect, useState } from "react";
import { getRendezVousAgent, confirmerRendezVous, annulerRendezVous } from "../services/api";
import logoAgsp from "../assets/logo.png";

const ONGLETS = [
  { cle: "en_attente", label: "En attente" },
  { cle: "valide", label: "Confirmés" },
  { cle: "refuse", label: "Annulés" },
];

function TableauDeBord() {
  const nom = localStorage.getItem("agentNom");
  const [rendezVous, setRendezVous] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);
  const [ongletActif, setOngletActif] = useState("en_attente");

  useEffect(() => {
    chargerRendezVous();
  }, []);

  const chargerRendezVous = async () => {
    setChargement(true);
    try {
      const data = await getRendezVousAgent();
      setRendezVous(data);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  const gererConfirmer = async (rdvId) => {
    setEnCours(rdvId);
    try {
      await confirmerRendezVous(rdvId);
      await chargerRendezVous();
      setOngletActif("valide");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnCours(null);
    }
  };

  const gererAnnuler = async (rdvId) => {
    setEnCours(rdvId);
    try {
      await annulerRendezVous(rdvId);
      await chargerRendezVous();
      setOngletActif("refuse");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnCours(null);
    }
  };

  const rendezVousFiltres = rendezVous.filter((rdv) => rdv.statut === ongletActif);

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <div className="h-[6px] w-full flex">
        <div className="flex-1 bg-vert"></div>
        <div className="flex-1 bg-jaune"></div>
        <div className="flex-1 bg-red-500"></div>
      </div>

      <header className="bg-white border-b border-[#DDD7C7]">
        <div className="max-w-6xl mx-auto px-8 pt-4 flex items-center gap-3">
          <img src={logoAgsp} alt="AGSP" className="w-20 h-20 shrink-0" />
          <div className="leading-tight">
            <p className="text-[11px] tracking-[0.2em] text-[#5B6B62] uppercase">République du Congo</p>
            <p className="text-[11px] tracking-[0.15em] text-[#5B6B62] uppercase">Espace agent</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-8 py-5">
          <h1 className="font-['Fraunces',serif] text-2xl text-[#14201C]">
            Bienvenue, {nom}
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {erreur && (
          <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{erreur}</p>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {ONGLETS.map((onglet) => {
            const nombre = rendezVous.filter((rdv) => rdv.statut === onglet.cle).length;
            return (
              <button
                key={onglet.cle}
                onClick={() => setOngletActif(onglet.cle)}
                className={
                  ongletActif === onglet.cle
                    ? "px-4 py-2 rounded-md text-sm font-medium bg-vert text-white"
                    : "px-4 py-2 rounded-md text-sm font-medium bg-white text-[#5B6B62] border border-[#DDD7C7] hover:border-vert transition-colors"
                }
              >
                {onglet.label} ({nombre})
              </button>
            );
          })}
        </div>

        {chargement ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-vert/30 border-t-vert animate-spin mb-4"></div>
            <p className="text-[#5B6B62] text-sm">Chargement des rendez-vous…</p>
          </div>
        ) : rendezVousFiltres.length === 0 ? (
          <div className="bg-white border border-[#DDD7C7] rounded-lg px-6 py-12 text-center">
            <p className="text-[#5B6B62] text-sm">Aucun rendez-vous dans cette catégorie.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#DDD7C7] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#F7F5EF] text-xs uppercase tracking-wide text-[#5B6B62] border-b border-[#DDD7C7]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Citoyen</th>
                  <th className="px-4 py-3 font-semibold">Démarche</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Heure</th>
                  {ongletActif === "en_attente" && <th className="px-4 py-3 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rendezVousFiltres.map((rdv) => (
                  <tr key={rdv.id} className="border-t border-[#EEEAE0]">
                    <td className="px-4 py-3 text-vert-dark font-medium">{rdv.prenom} {rdv.nom}</td>
                    <td className="px-4 py-3 text-[#3C4A42]">{rdv.demarche}</td>
                    <td className="px-4 py-3 text-[#3C4A42]">{rdv.date}</td>
                    <td className="px-4 py-3 text-[#3C4A42]">{rdv.heure}</td>
                    {ongletActif === "en_attente" && (
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => gererConfirmer(rdv.id)}
                          disabled={enCours === rdv.id}
                          className="bg-vert text-white px-3 py-1.5 rounded-md text-sm disabled:opacity-50"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => gererAnnuler(rdv.id)}
                          disabled={enCours === rdv.id}
                          className="bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-md text-sm hover:bg-red-50 disabled:opacity-50"
                        >
                          Annuler
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableauDeBord;