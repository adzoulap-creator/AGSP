import { useLocation, useNavigate, Link } from "react-router-dom";
import NavBar from "../composent/navBar";

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { rendezVousId, creneau } = location.state || {};

  if (!rendezVousId || !creneau) {
    navigate("/");
    return null;
  }

  const codeSuivi = `RV-${String(rendezVousId).padStart(6, "0")}`;
  const dateFormatee = new Date(`${creneau.date}T${creneau.heure}`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-jaune/5">
      <NavBar />

      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-vert flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">✓</span>
        </div>

        <h1 className="font-bold text-vert-dark text-3xl mb-2">Rendez-vous confirmé</h1>
        <p className="text-gray-500 mb-10">Un code de suivi vous a été envoyé par email</p>

        <div className="bg-white rounded-2xl shadow-sm p-6 text-left flex flex-col gap-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Administration</span>
            <span className="font-medium text-vert-dark">{creneau.administration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Démarche</span>
            <span className="font-medium text-vert-dark">{creneau.demarche}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date</span>
            <span className="font-medium text-vert-dark capitalize">{dateFormatee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Heure</span>
            <span className="font-medium text-vert-dark">{creneau.heure.slice(0, 5)}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-100">
            <span className="text-gray-400">Code de suivi</span>
            <span className="font-bold text-vert-dark">{codeSuivi}</span>
          </div>
        </div>

        <Link
          to="/"
          className="inline-block mt-10 bg-vert hover:bg-vert-dark text-white px-8 py-3 rounded-full font-medium transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default Confirmation;