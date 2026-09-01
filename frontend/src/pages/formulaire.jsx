import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../composent/navBar";
import { getCreneauDetail, creerRendezVous } from "../services/api";

function Formulaire() {
  const location = useLocation();
  const navigate = useNavigate();
  const creneauId = location.state?.creneauId;

  const [creneau, setCreneau] = useState(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [cleIdempotence] = useState(() => crypto.randomUUID());
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!creneauId) {
      navigate("/");
      return;
    }
    getCreneauDetail(creneauId)
      .then(setCreneau)
      .catch((err) => setErreur(err.message));
  }, [creneauId, navigate]);

  const soumettre = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const rdv = await creerRendezVous({
        creneau: creneauId,
        nom,
        prenom,
        email,
        telephone,
        cle_idempotence: cleIdempotence,
      });
      navigate("/confirmation", { state: { rendezVousId: rdv.id, creneau } });
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-2 text-xs text-[#5B6B62]">
          <span className="text-vert font-semibold">Étape 4 sur 5</span>
          <span>·</span>
          <span>Vos informations</span>
        </div>
        <div className="flex gap-1.5 mt-3 mb-10">
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-[#DDD7C7]"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="font-['Fraunces',serif] text-3xl text-[#14201C] mb-8">Vos informations</h1>

        <div className="flex gap-10 items-start flex-wrap">
          <form onSubmit={soumettre} className="flex-1 min-w-[280px] bg-white rounded-lg border border-[#DDD7C7] p-6 flex flex-col gap-4">
            <div>
              <label className="text-sm text-[#5B6B62]">Nom</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full bg-white rounded-md px-4 py-2.5 border border-[#DDD7C7] outline-none focus:border-vert focus:ring-1 focus:ring-vert mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-[#5B6B62]">Prénom</label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full bg-white rounded-md px-4 py-2.5 border border-[#DDD7C7] outline-none focus:border-vert focus:ring-1 focus:ring-vert mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-[#5B6B62]">Téléphone</label>
              <input
                type="tel"
                required
                placeholder="06 000 00 00"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full bg-white rounded-md px-4 py-2.5 border border-[#DDD7C7] outline-none focus:border-vert focus:ring-1 focus:ring-vert mt-1 placeholder:text-[#9AA39C]"
              />
            </div>

            <div>
              <label className="text-sm text-[#5B6B62]">Email</label>
              <input
                type="email"
                required
                placeholder="vous@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white rounded-md px-4 py-2.5 border border-[#DDD7C7] outline-none focus:border-vert focus:ring-1 focus:ring-vert mt-1 placeholder:text-[#9AA39C]"
              />
            </div>

            {erreur && (
              <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3">
                <p className="text-red-600 text-sm">{erreur}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={envoi || !creneau}
              className="mt-2 bg-vert hover:bg-vert-dark text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {envoi ? "Envoi..." : "Confirmer"}
            </button>
          </form>

          <div className="w-64 shrink-0">
            <div className="bg-white rounded-lg border border-[#DDD7C7] p-6 sticky top-8">
              <p className="text-xs tracking-[0.15em] uppercase text-[#5B6B62] font-semibold mb-3">Récapitulatif</p>
              {creneau ? (
                <>
                  <p className="font-semibold text-vert-dark">{creneau.administration}</p>
                  <p className="text-[#5B6B62]">{creneau.demarche}</p>
                  <p className="text-[#5B6B62] mt-2 capitalize">
                    {new Date(`${creneau.date}T${creneau.heure}`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}, {creneau.heure.slice(0, 5)}
                  </p>
                </>
              ) : (
                <p className="text-[#9AA39C] text-sm">Chargement...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Formulaire;