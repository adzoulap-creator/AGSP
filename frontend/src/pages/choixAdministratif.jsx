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
    <div className="min-h-screen bg-[#F7F5EF]">
      <NavBar />

      <div className="max-w-3xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-2 text-xs text-[#5B6B62]">
          <span className="text-vert font-semibold">Étape 1 sur 5</span>
          <span>·</span>
          <span>Choix de l'administration</span>
        </div>
        <div className="flex gap-1.5 mt-3 mb-10">
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-[#DDD7C7]"></div>
          <div className="h-1 flex-1 rounded-full bg-[#DDD7C7]"></div>
          <div className="h-1 flex-1 rounded-full bg-[#DDD7C7]"></div>
          <div className="h-1 flex-1 rounded-full bg-[#DDD7C7]"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <span className="inline-block text-xs tracking-[0.18em] uppercase text-vert font-semibold bg-vert/10 border border-vert/30 px-3 py-1 rounded-full mb-4">
          Annuaire officiel
        </span>
        <h1 className="font-['Fraunces',serif] text-3xl text-[#14201C] mb-2">Choisir une administration</h1>
        <p className="text-sm text-[#5B6B62] mb-8">
          Sélectionnez l'administration auprès de laquelle vous souhaitez effectuer votre démarche.
        </p>

        <div className="relative mb-10">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5B6B62]">🔍</span>
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une administration ou une ville"
            className="w-full bg-white rounded-lg pl-12 pr-5 py-3.5 border border-[#DDD7C7] outline-none focus:border-vert focus:ring-1 focus:ring-vert text-[#14201C] placeholder:text-[#9AA39C] transition-colors"
          />
        </div>

        {chargement && (
          <div className="text-center py-16">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-vert/30 border-t-vert animate-spin mb-4"></div>
            <p className="text-[#5B6B62] text-sm">Chargement des administrations…</p>
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
            {filtrees.map((admin) => (
              <AdministrationCard key={admin.id} id={admin.id} nom={admin.nom} ville={admin.ville} />
            ))}
            {filtrees.length === 0 && (
              <div className="bg-white border border-[#DDD7C7] rounded-lg px-6 py-12 text-center">
                <p className="text-[#5B6B62] text-sm">Aucune administration trouvée pour « {recherche} ».</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-[6px] w-full flex">
        <div className="flex-1 bg-vert"></div>
        <div className="flex-1 bg-jaune"></div>
        <div className="flex-1 bg-vert"></div>
      </div>
    </div>
  );
}

export default ChoixAdministratif;