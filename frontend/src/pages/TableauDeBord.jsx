import { useEffect, useState } from "react";
import { getRendezVousAgent, confirmerRendezVous, annulerRendezVous } from "../services/api";

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
    <div className="min-h-screen bg-jaune/5 p-8">
      <h1 className="font-bold text-vert-dark text-2xl mb-6">
        Bienvenue, {nom}
      </h1>

      {erreur && <p className="text-red-500 text-sm mb-4">{erreur}</p>}

      <div className="flex gap-2 mb-6">
        {ONGLETS.map((onglet) => {
          const nombre = rendezVous.filter((rdv) => rdv.statut === onglet.cle).length;
          return (
            <button
              key={onglet.cle}
              onClick={() => setOngletActif(onglet.cle)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                ongletActif === onglet.cle
                  ? "bg-vert text-white"
                  : "bg-white text-gray-500 shadow-sm"
              }`}
            >
              {onglet.label} ({nombre})
            </button>
          );
        })}
      </div>

      {chargement ? (
        <p className="text-gray-500">Chargement...</p>
      ) : rendezVousFiltres.length === 0 ? (
        <p className="text-gray-500">Aucun rendez-vous dans cette catégorie.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="px-4 py-3">Citoyen</th>
                <th className="px-4 py-3">Démarche</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Heure</th>
                {ongletActif === "en_attente" && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rendezVousFiltres.map((rdv) => (
                <tr key={rdv.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{rdv.prenom} {rdv.nom}</td>
                  <td className="px-4 py-3">{rdv.demarche}</td>
                  <td className="px-4 py-3">{rdv.date}</td>
                  <td className="px-4 py-3">{rdv.heure}</td>
                  {ongletActif === "en_attente" && (
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => gererConfirmer(rdv.id)}
                        disabled={enCours === rdv.id}
                        className="bg-vert text-white px-3 py-1 rounded-full text-sm disabled:opacity-50"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => gererAnnuler(rdv.id)}
                        disabled={enCours === rdv.id}
                        className="bg-red-500 text-white px-3 py-1 rounded-full text-sm disabled:opacity-50"
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
  );
}

export default TableauDeBord;