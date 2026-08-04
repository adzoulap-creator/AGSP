import { Link } from "react-router-dom";

function DemarcheCard({ id, nom, dureeMinutes }) {
  return (
    <Link
      to={`/demarches/${id}/creneau`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow px-6 py-5 flex items-center justify-between"
    >
      <p className="font-semibold text-vert-dark text-lg">{nom}</p>
      <p className="text-gray-500 text-sm">Durée estimée : {dureeMinutes} min</p>
    </Link>
  );
}

export default DemarcheCard;