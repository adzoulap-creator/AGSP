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
    <div className="min-h-screen bg-[#F7F5EF]">
      <NavBar />

      <div className="max-w-3xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-2 text-xs text-[#5B6B62]">
          <span className="text-vert font-semibold">Étape 2 sur 5</span>
          <span>·</span>
          <span>Choix de la démarche</span>
        </div>
        <div className="flex gap-1.5 mt-3 mb-10">
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-[#DDD7C7]"></div>
          <div className="h-1 flex-1 rounded-full bg-[#DDD7C7]"></div>
          <div className="h-1 flex-1 rounded-full bg-[#DDD7C7]"></div>
        </div>
      </div>

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