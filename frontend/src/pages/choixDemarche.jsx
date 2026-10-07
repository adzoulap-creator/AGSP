import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../composent/navBar";
import ParcoursEtapes from "../composent/ParcoursEtapes";
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
    <div className="min-h-screen bg-[#F7F5EF]">
      <NavBar />

      <title>Choisir une démarche · AGSP</title>
      <ParcoursEtapes etape={2} />

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h1 className="font-['Fraunces',serif] text-3xl text-[#14201C] mb-8">
          Quelle démarche souhaitez-vous faire ?
        </h1>

        {chargement && (
          <div className="text-center py-16">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-vert/30 border-t-vert animate-spin mb-4"></div>
            <p className="text-[#5B6B62] text-sm">Chargement des démarches…</p>
          </div>
        )}

        {erreur && (
          <div className="bg-white border border-red-200 rounded-lg px-6 py-8 text-center">
            <p className="text-red-600 text-sm font-medium mb-1">Une erreur est survenue</p>
            <p className="text-[#5B6B62] text-sm">{erreur}</p>
          </div>
        )}

        {!chargement && !erreur && (
          <div className="flex flex-col gap-4">
            {demarches.map((d) => (
              <DemarcheCard key={d.id} id={d.id} nom={d.nom} dureeMinutes={d.duree_minutes} />
            ))}
            {demarches.length === 0 && (
              <div className="bg-white border border-[#DDD7C7] rounded-lg px-6 py-12 text-center">
                <p className="text-[#5B6B62] text-sm">Aucune démarche disponible pour cette administration.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChoixDemarche;