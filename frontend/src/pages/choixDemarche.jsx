import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../composent/navBar";
import DemarcheCard from "../composent/DemarcheCard";
import { getDemarches } from "../services/api";

function ChoixDemarche() {
  const { administrationId } = useParams();
  const [demarches, setDemarches] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    getDemarches(administrationId)
      .then((data) => setDemarches(data))
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, [administrationId]);

  return (
    <div className="min-h-screen bg-jaune/5">
      <NavBar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-bold text-vert-dark text-3xl mb-6">
          Quelle démarche souhaitez-vous faire ?
        </h1>

        {chargement && <p className="text-gray-400 text-center mt-8">Chargement...</p>}
        {erreur && <p className="text-red-500 text-center mt-8">{erreur}</p>}

        {!chargement && !erreur && (
          <div className="flex flex-col gap-4">
            {demarches.map((d) => (
              <DemarcheCard key={d.id} id={d.id} nom={d.nom} dureeMinutes={d.duree_minutes} />
            ))}
            {demarches.length === 0 && (
              <p className="text-gray-400 text-center mt-8">Aucune démarche disponible.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChoixDemarche;