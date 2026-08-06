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
    <div className="min-h-screen bg-jaune/5">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-bold text-vert-dark text-3xl mb-8">Vos informations</h1>

        <div className="flex gap-10 items-start flex-wrap">
          <form onSubmit={soumettre} className="flex-1 min-w-[280px] flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-500">Nom</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full bg-white rounded-full px-5 py-3 shadow-sm border border-gray-200 outline-none focus:border-vert"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Prénom</label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full bg-white rounded-full px-5 py-3 shadow-sm border border-gray-200 outline-none focus:border-vert"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Téléphone</label>
              <input
                type="tel"
                required
                placeholder="06 000 00 00"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full bg-white rounded-full px-5 py-3 shadow-sm border border-gray-200 outline-none focus:border-vert"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Email</label>
              <input
                type="email"
                required
                placeholder="vous@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white rounded-full px-5 py-3 shadow-sm border border-gray-200 outline-none focus:border-vert"
              />
            </div>

            {erreur && <p className="text-red-500">{erreur}</p>}

            <button
              type="submit"
              disabled={envoi || !creneau}
              className="mt-4 bg-vert hover:bg-vert-dark text-white px-6 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
            >
              {envoi ? "Envoi..." : "Confirmer"}
            </button>
          </form>

          <div className="w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-12">
              <p className="text-sm text-gray-400 mb-3">RÉCAPITULATIF</p>
              {creneau ? (
                <>
                  <p className="font-semibold text-vert-dark">{creneau.administration}</p>
                  <p className="text-gray-600">{creneau.demarche}</p>
                  <p className="text-gray-600 mt-2 capitalize">
                    {new Date(`${creneau.date}T${creneau.heure}`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}, {creneau.heure.slice(0, 5)}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Chargement...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Formulaire;