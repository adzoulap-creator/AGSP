import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();

  const liens = [
    { label: "Accueil", chemin: "/" },
    { label: "Démarches", chemin: "/administrations" },
    { label: "Suivi", chemin: "/suivi" },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-vert-dark">
          AGSP
        </Link>

        <nav className="flex items-center gap-8">
          {liens.map((lien) => {
            const actif = location.pathname === lien.chemin;
            return (
              <Link
                key={lien.chemin}
                to={lien.chemin}
                className={
                  actif
                    ? "text-vert font-semibold"
                    : "text-gray-600 hover:text-vert transition-colors"
                }
              >
                {lien.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/administrations"
          className="bg-vert hover:bg-vert-dark text-white px-5 py-2 rounded-full font-medium transition-colors"
        >
          Prendre rendez-vous
        </Link>
      </div>
    </header>
  );
}

export default NavBar;