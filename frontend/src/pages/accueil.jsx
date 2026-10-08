import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../composent/navBar";
import SceauAnime from "../composent/SceauAnime";
import RechercheDemarche from "../composent/RechercheDemarche";
import { getAdministrations, getToutesDemarches } from "../services/api";
import SceauAGSP from "../composent/SceauAGSP";
import "./accueil.css";

const ETAPES = [
  {
    titre: "Choisissez l'administration",
    texte: "Celle qui s'occupe de votre démarche.",
  },
  {
    titre: "Sélectionnez la démarche",
    texte: "Le temps à prévoir sur place est indiqué pour chacune.",
  },
  {
    titre: "Choisissez le jour et l'heure",
    texte: "Du lundi au vendredi, de 8 h à 15 h. Le créneau vous est gardé 10 minutes.",
  },
  {
    titre: "Laissez vos coordonnées",
    texte: "Nom, prénom, téléphone et adresse email.",
  },
  {
    titre: "Recevez la confirmation",
    texte: "Un premier email accuse réception, un second arrive quand un agent valide le rendez-vous.",
  },
];

const NB_ADMINISTRATIONS = 8;
const CHARGEMENT = { etat: "chargement", administrations: [], demarches: [] };

// Charge les administrations ouvertes et leurs démarches. Ne rejette jamais.
// Si seule la liste des démarches échoue, l'annuaire reste affiché et seule
// la liste déroulante signale le problème.
function chargerDonnees() {
  return Promise.allSettled([getAdministrations(), getToutesDemarches()]).then(([admins, liste]) => {
    if (admins.status === "rejected") return { ...CHARGEMENT, etat: "erreur" };
    const administrations = admins.value;
    if (liste.status === "rejected") return { etat: "pret", administrations, demarches: [], demarchesIndisponibles: true };
    const ouvertes = new Set(administrations.map((a) => a.id));
    return {
      etat: "pret",
      administrations,
      demarches: liste.value.filter((d) => ouvertes.has(d.administration)),
    };
  });
}

function Accueil() {
  const [donnees, setDonnees] = useState(CHARGEMENT);
  const { etat, administrations, demarches, demarchesIndisponibles } = donnees;

  useEffect(() => {
    chargerDonnees().then(setDonnees);
  }, []);

  const reessayer = () => {
    if (etat === "nouvel-essai") return;
    setDonnees({ ...CHARGEMENT, etat: "nouvel-essai" });
    chargerDonnees().then(setDonnees);
  };

  const nbDemarches = (adminId) => demarches.filter((d) => d.administration === adminId).length;

  return (
    <div className="accueil min-h-screen bg-papier text-encre">
      <title>AGSP · Rendez-vous des services publics</title>
      <NavBar />

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-x-12 px-6 pb-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:pb-16 lg:pt-4">
            <div className="relative -mx-6 flex justify-center overflow-hidden py-8 lg:order-2 lg:mx-0 lg:overflow-visible lg:py-10">
              <SceauAnime />
            </div>

            <div className="relative z-10 lg:order-1">
              {/* « file d'attente » et « rendez-vous » ne sont jamais coupés en fin de ligne */}
              <h1 className="font-titre text-[clamp(1.85rem,1.1rem+3.3vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.02em]">
                <span className="block text-balance">
                  Plus de <span className="whitespace-nowrap">file d'attente.</span>
                </span>
                <span className="block text-balance">
                  Vos démarches, sur <span className="whitespace-nowrap">rendez-vous.</span>
                </span>
              </h1>
              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-gris">
                Choisissez l'administration, la démarche et l'heure qui vous conviennent.
                Vous êtes reçu au moment prévu, sans attendre au guichet.
              </p>

              <RechercheDemarche
                etat={demarchesIndisponibles || etat === "nouvel-essai" ? "erreur" : etat}
                demarches={demarches}
                administrations={administrations}
              />

            </div>
          </div>
        </section>

        <section aria-labelledby="titre-etapes" className="etapes border-y border-encre/10">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <h2 id="titre-etapes" className="font-titre text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
              Prendre rendez-vous en 5 étapes
            </h2>

            <ol role="list" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {ETAPES.map((etape, i) => (
                <li key={etape.titre} className="ticket">
                  <p className="ticket-talon">
                    <span className="text-sm font-bold" aria-hidden="true">N°</span>
                    <span className="sr-only">Étape </span>
                    <span className="font-titre text-5xl font-semibold leading-none">{i + 1}</span>
                  </p>
                  <div className="ticket-corps">
                    <h3 className="font-bold leading-snug">{etape.titre}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gris">{etape.texte}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link to="/administrations" className="lien-souligne mt-10 inline-block font-bold text-sceau-vert">
              Commencer par choisir l'administration
            </Link>
          </div>
        </section>

        <section aria-labelledby="titre-annuaire">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 id="titre-annuaire" className="font-titre text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
                Administrations disponibles
              </h2>
              {administrations.length > NB_ADMINISTRATIONS && (
                <Link to="/administrations" className="lien-souligne font-bold text-sceau-vert">
                  Voir les {administrations.length} administrations
                </Link>
              )}
            </div>

            {etat === "chargement" && (
              <p role="status" className="mt-8 text-gris">Chargement des administrations…</p>
            )}

            {(etat === "erreur" || etat === "nouvel-essai") && (
              <div role="alert" className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-rouge/30 bg-rouge/5 px-5 py-4">
                <p>La liste des administrations n'a pas pu être chargée. Vérifiez votre connexion puis réessayez.</p>
                <button
                  type="button"
                  onClick={reessayer}
                  aria-disabled={etat === "nouvel-essai"}
                  className="rounded-full border-2 border-encre px-5 py-2 text-sm font-bold transition-colors hover:bg-encre hover:text-papier aria-disabled:cursor-wait aria-disabled:opacity-60"
                >
                  {etat === "nouvel-essai" ? "Chargement…" : "Réessayer"}
                </button>
              </div>
            )}

            {etat === "pret" && administrations.length === 0 && (
              <p className="mt-8 text-gris">Aucune administration ne propose encore la prise de rendez-vous en ligne.</p>
            )}

            {administrations.length > 0 && (
              <ul className="mt-8 border-t-2 border-encre">
                {administrations.slice(0, NB_ADMINISTRATIONS).map((admin) => {
                  const n = nbDemarches(admin.id);
                  return (
                    <li key={admin.id} className="border-b border-encre/15">
                      <Link
                        to={`/administrations/${admin.id}/demarches`}
                        className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-5 transition-colors hover:bg-sceau-jaune/10 sm:px-2"
                      >
                        <span>
                          <span className="block font-titre text-xl font-semibold group-hover:text-sceau-vert sm:text-2xl">
                            {admin.nom}
                          </span>
                          {(admin.adresse || admin.ville) && (
                            <span className="mt-1 block text-sm text-gris">
                              {[admin.adresse, admin.ville].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </span>
                        <span className="text-sm font-bold text-sceau-vert">
                          {n === 1 ? "1 démarche" : `${n} démarches`}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-sceau-vert text-papier">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <SceauAGSP complet={false} className="h-14 w-14 shrink-0 rounded-full ring-2 ring-papier" />
            <div>
              <p className="font-titre text-xl font-semibold">AGSP</p>
              <p className="text-sm text-papier/80">Application de Gestion des Services Publics, République du Congo</p>
            </div>
          </div>
          <nav aria-label="Liens du pied de page" className="flex gap-6 text-sm font-bold">
            <Link to="/About" className="hover:underline">À propos</Link>
            <Link to="/agent/connexion" className="hover:underline">Espace agent</Link>
          </nav>
        </div>
        <div className="flex h-[6px]" aria-hidden="true">
          <div className="flex-1 bg-[#0B7A3E]"></div>
          <div className="flex-1 bg-sceau-jaune"></div>
          <div className="flex-1 bg-rouge"></div>
        </div>
      </footer>
    </div>
  );
}

export default Accueil;
