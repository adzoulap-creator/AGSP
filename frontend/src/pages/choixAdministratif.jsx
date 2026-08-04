import { useState, useEffect } from "react";
import NavBar from "../composent/navBar";
import AdministrationCard from "../composent/AdministrationCard";
import { getAdministrations } from "../services/api";

function ChoixAdministratif() {
  const [administrations, setAdministrations] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    getAdministrations()
      .then((data) => setAdministrations(data))
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  const filtrees = administrations.filter((admin) =>
    (admin.nom + " " + admin.ville).toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-jaune/5">
      <NavBar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-bold text-vert-dark text-3xl mb-6">Choisir une administration</h1>

        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une administration ou une ville"
          className="w-full bg-white rounded-full px-6 py-3 shadow-sm border border-gray-200 mb-8 outline-none focus:border-vert"
        />

        {chargement && <p className="text-gray-400 text-center mt-8">Chargement...</p>}
        {erreur && <p className="text-red-500 text-center mt-8">{erreur}</p>}

        {!chargement && !erreur && (
          <div className="flex flex-col gap-4">
            {filtrees.map((admin) => (
              <AdministrationCard key={admin.id} id={admin.id} nom={admin.nom} ville={admin.ville} />
            ))}
            {filtrees.length === 0 && (
              <p className="text-gray-400 text-center mt-8">Aucune administration trouvée.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChoixAdministratif;