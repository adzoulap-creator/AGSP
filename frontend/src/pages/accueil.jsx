import NavBar from '../composent/navBar';
import PrendreRendezVous from '../composent/buttonRDV';
import ServiceCard from '../composent/ServiceCard';
import logoAgsp from "../assets/logo.png";
import { Link } from "react-router-dom";

function Accueil() {
    return (
        <div className="min-h-screen bg-[#F7F5EF]">
            <div className="animate-[slideDown_1s_ease-out] shadow-lg rounded-lg">
                <NavBar />
            </div>
            <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
                <div>
                    <span className="inline-block text-xs tracking-[0.18em] uppercase text-vert font-semibold bg-vert/10 border border-vert/30 px-3 py-1 rounded-full mb-6">
                        Plateforme officielle
                    </span>
                    <h1 className="font-['Fraunces',serif] text-5xl leading-[1.1] text-[#14201C]">
                        <span
                            className="inline-block whitespace-nowrap"
                            style={{ animation: "reveal 2s steps(13, end) forwards" }}
                        >
                            Bienvenue sur
                        </span>{" "}
                        <span
                            className="text-vert inline-block"
                            style={{ opacity: 0, animation: "zoomIn 0.5s ease-out 2.1s forwards" }}
                        >
                            AGSP
                        </span>
                    </h1>
                    <p className="text-lg text-[#3C4A42] mt-5 max-w-lg">
                        Application de Gestion des Services Publics.
                    </p>
                    <p className="text-base text-[#5B6B62] mt-3 max-w-lg leading-relaxed">
                        Réservez un rendez-vous avec un service public pour la création de vos papiers administratifs, sans vous déplacer ni faire la queue.
                    </p>

                    <div className="mt-10 flex items-center gap-6">
                        <PrendreRendezVous />
                    </div>

                    <div className="mt-12 flex items-center gap-8 text-xs text-[#5B6B62]">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-vert"></span>
                            Service gratuit
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-jaune"></span>
                            Données sécurisées
                        </span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <img
                        src={logoAgsp}
                        alt="Sceau AGSP - République du Congo"
                        className="w-64 h-64 animate-[float_2s_ease-in-out_infinite]"
                    />
                    <style>{`
                        @keyframes float {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-20px); }
                        }
                    `}</style>
                </div>
            </section>

            <footer className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-[#5B6B62]">
                <span>© République du Congo — AGSP</span>
                <Link to="/agent/connexion" className="hover:text-vert transition-colors text-lg">
                    Espace agent
                </Link>
            </footer>

            <div className="h-[6px] w-full flex">
                <div className="flex-1 bg-vert"></div>
                <div className="flex-1 bg-jaune"></div>
                <div className="flex-1 bg-red-500"></div>
            </div>
            <style>{`

                @keyframes slideDown {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }
                @keyframes reveal {
                from { clip-path: inset(0 100% 0 0); }
                to { clip-path: inset(0 0% 0 0); }
                }
                @keyframes blink {
                    50% { border-color: transparent; }
                }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.2); }
                    to { opacity: 1; transform: scale(1); }
                }

            `}</style>
        </div>
    );
}

export default Accueil;