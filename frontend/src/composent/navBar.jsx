import { Link, useLocation } from "react-router-dom";
import SceauAGSP from "./SceauAGSP";

function NavBar() {
  const location = useLocation();

  const liens = [
    { label: "Accueil", chemin: "/" },
    { label: "Démarches", chemin: "/administrations" },
    { label: "À propos", chemin: "/About" },
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

      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <SceauAGSP complet={false} className="w-12 h-12 md:w-16 md:h-16 shrink-0" />

          <div className="hidden min-[360px]:block leading-tight">
            <p className="font-['Fraunces',serif] text-xl font-semibold text-vert-dark">AGSP</p>
            <p className="hidden sm:block text-[10px] text-[#5B6B62] tracking-wide">Gestion des Services Publics</p>
          </div>
        </Link>

        {/* Sur mobile, les liens passent sur une seconde ligne sous le logo et le bouton. */}
        <nav
          aria-label="Navigation principale"
          className="order-last flex w-full items-center gap-6 border-t border-[#EEE9DC] pt-2 md:order-none md:w-auto md:gap-8 md:border-0 md:pt-0"
        >
          {liens.map((lien) => {
            const actif = location.pathname === lien.chemin;
            return (
              <Link
                key={lien.chemin}
                to={lien.chemin}
                aria-current={actif ? "page" : undefined}
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
          className="bg-vert hover:bg-vert-dark text-white px-4 py-2.5 md:px-5 rounded-md text-sm font-medium text-center leading-tight transition-colors"
        >
          Prendre rendez-vous
        </Link>
      </div>
    </header>
  );
}

export default NavBar;