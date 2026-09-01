import { Link, useLocation } from "react-router-dom";
import logoAgsp from "../assets/logo.png";

function NavBar() {
  const location = useLocation();

  const liens = [
    { label: "Accueil", chemin: "/" },
    { label: "Démarches", chemin: "/administrations" },
    { label: "Suivi", chemin: "/suivi" },
  ];

  return (
    <header className="w-full bg-white border-b border-[#DDD7C7]">
      <div className="h-[6px] w-full flex">
        <div className="flex-1 bg-vert"></div>
        <div className="flex-1 bg-jaune"></div>
        <div className="flex-1 bg-red-500"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-3">
        <p className="text-[10px] tracking-[0.2em] text-[#5B6B62] uppercase">République du Congo — Service Public Numérique</p>
      </div>

      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAgsp} alt="AGSP" className="w-20 h-20 shrink-0" />

          <div className="leading-tight">
            <p className="font-['Fraunces',serif] text-xl font-semibold text-vert-dark">AGSP</p>
            <p className="text-[10px] text-[#5B6B62] tracking-wide">Gestion des Services Publics</p>
          </div>
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
                    ? "text-vert font-semibold text-sm pb-1 border-b-2 border-vert transition-all duration-200"
                    : "text-[#5B6B62] hover:text-vert transition-all duration-200 text-sm pb-1 border-b-2 border-transparent"
                }
              >
                {lien.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/administrations"
          className="bg-vert hover:bg-vert-dark text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          Prendre rendez-vous
        </Link>
      </div>
    </header>
  );
}

export default NavBar;