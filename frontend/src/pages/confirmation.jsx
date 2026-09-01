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
    <div className="min-h-screen bg-[#F7F5EF]">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-2 text-xs text-[#5B6B62]">
          <span className="text-vert font-semibold">Étape 5 sur 5</span>
          <span>·</span>
          <span>Confirmation</span>
        </div>
        <div className="flex gap-1.5 mt-3 mb-10">
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
          <div className="h-1 flex-1 rounded-full bg-vert"></div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 pb-16 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-vert flex items-center justify-center mx-auto mb-6">
          <span className="text-vert text-2xl">✓</span>
        </div>

        <span className="inline-block text-xs tracking-[0.18em] uppercase text-vert font-semibold bg-vert/10 border border-vert/30 px-3 py-1 rounded-full mb-4">
          Dossier {codeSuivi}
        </span>

        <h1 className="font-['Fraunces',serif] text-3xl text-[#14201C] mb-8">
          Rendez-vous en attente de confirmation
        </h1>

        <div className="bg-white rounded-lg border border-[#DDD7C7] p-6 text-left flex flex-col gap-4">
          <div className="flex justify-between border-b border-[#EEEAE0] pb-3">
            <span className="text-[#5B6B62]">Administration</span>
            <span className="font-medium text-vert-dark">{creneau.administration}</span>
          </div>
          <div className="flex justify-between border-b border-[#EEEAE0] pb-3">
            <span className="text-[#5B6B62]">Démarche</span>
            <span className="font-medium text-vert-dark">{creneau.demarche}</span>
          </div>
          <div className="flex justify-between border-b border-[#EEEAE0] pb-3">
            <span className="text-[#5B6B62]">Date</span>
            <span className="font-medium text-vert-dark capitalize">{dateFormatee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B6B62]">Heure</span>
            <span className="font-medium text-vert-dark">{creneau.heure.slice(0, 5)}</span>
          </div>
        </div>

        <p className="text-xs text-[#9AA39C] mt-6">
          Conservez votre code de dossier <span className="font-medium text-[#5B6B62]">{codeSuivi}</span> pour suivre l'avancement de votre démarche.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 bg-vert hover:bg-vert-dark text-white px-8 py-3 rounded-md font-medium transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default Confirmation;