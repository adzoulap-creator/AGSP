import { Link } from "react-router-dom";

function AdministrationCard({ id, nom, ville }) {
  return (
    <Link
      to={`/administrations/${id}/demarches`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow px-6 py-5 flex items-center justify-between"
    >
      <div>
        <p className="font-semibold text-vert-dark text-lg">{nom}</p>
        <p className="text-gray-500 text-sm mt-1">{ville}</p>
      </div>
      <span className="text-vert text-xl">›</span>
    </Link>
  );
}

export default AdministrationCard;