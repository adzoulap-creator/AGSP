import NavBar from '../composent/navBar';
import PrendreRendezVous from '../composent/buttonRDV';
import ServiceCard from '../composent/ServiceCard';
import { Link } from "react-router-dom";

function Accueil() {
    return (
        <div className="grid grid-rows-[80%_20%] h-screen">

            <div className="grid grid-cols-[50%_50%] w-full">
                <div>
                  <NavBar />
                  <div className="block">
                    <p className="font-bold text-jaune text-4xl mt-16 ml-16">Bienvenue sur AGSP,</p>
                    <p className="text-black text-2xl ml-16 mt-2">Application de Gestion des Services Publics,</p>
                    <p className="text-black text-2xl ml-16 mt-7">
                      Réservez un rendez-vous avec un service public pour la création de vos papiers administratifs.
                    </p>
                    <div className="mt-12 ml-16"><PrendreRendezVous /></div>
                  </div>
                </div>

                <div className="bg-vert flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white text-6xl">🏛️</span>
                  </div>
                </div>
            </div>
            <div className="text-center py-3">
              <Link to="/agent/connexion" className="text-xs text-gray-700 hover:text-vert transition-colors">
                Espace agent
              </Link>
            </div>


        </div>
    );
}

export default Accueil;