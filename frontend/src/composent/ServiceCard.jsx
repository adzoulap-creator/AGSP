import { Link } from "react-router-dom";

function ServiceCard({ titre, sousTitre, administrationId }) {
  return (
    <Link
      to={`/administrations/${administrationId}/demarches`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow px-6 py-5 flex flex-col justify-center"
    >
      <p className="font-semibold text-vert-dark text-lg">{titre}</p>
      <p className="text-gray-500 text-sm mt-1">{sousTitre}</p>
    </Link>
  );
}

export default ServiceCard;