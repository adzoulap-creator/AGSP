import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const AUTRE = "autre";
const NB_RESULTATS = 5;

// Insensible aux accents, à la casse et à la ponctuation, mot par mot :
// « carte identite » trouve « Carte d'identité ».
function normaliser(texte) {
  return (texte || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const classeChamp =
  "h-14 w-full rounded-2xl border-2 border-[#7D8983] bg-white px-5 text-lg text-encre focus:border-sceau-vert focus:outline-none focus-visible:ring-4 focus-visible:ring-sceau-vert/20";

// Choix de la démarche depuis l'accueil : une liste déroulante groupée par
// administration, plus « Autre » pour chercher en saisie libre.
// Le bouton principal mène directement au calendrier quand une démarche est choisie.
function RechercheDemarche({ etat, demarches, administrations }) {
  const [choix, setChoix] = useState("");
  const [recherche, setRecherche] = useState("");
  const idListe = useId();
  const idChamp = useId();
  const idStatut = useId();

  const parId = new Map(administrations.map((a) => [a.id, a]));
  const groupes = administrations
    .map((admin) => ({ admin, demarches: demarches.filter((d) => d.administration === admin.id) }))
    .filter((g) => g.demarches.length > 0);
  const demarcheChoisie = demarches.find((d) => String(d.id) === choix);
  const adminChoisie = demarcheChoisie && parId.get(demarcheChoisie.administration);

  const saisieLibre = choix === AUTRE;
  const mots = normaliser(recherche).split(" ").filter(Boolean);
  const actif = saisieLibre && mots.join("").length >= 2;
  const resultats = actif
    ? demarches.filter((d) => {
        const admin = parId.get(d.administration);
        const texte = normaliser([d.nom, admin?.nom, admin?.ville].join(" "));
        return mots.every((mot) => texte.includes(mot));
      })
    : [];

  let statut = "";
  if (actif && resultats.length === 0) statut = "Aucune démarche proposée en ligne ne correspond à votre recherche.";
  else if (actif && resultats.length > NB_RESULTATS) statut = `${NB_RESULTATS} premières démarches sur ${resultats.length}. Précisez votre recherche.`;
  else if (actif) statut = resultats.length === 1 ? "1 démarche trouvée." : `${resultats.length} démarches trouvées.`;

  // Le message n'est mis à jour qu'une demi-seconde après la dernière frappe :
  // les lecteurs d'écran ne le relisent pas à chaque caractère.
  const [statutAnnonce, setStatutAnnonce] = useState("");
  useEffect(() => {
    const minuteur = setTimeout(() => setStatutAnnonce(statut), 500);
    return () => clearTimeout(minuteur);
  }, [statut]);

  let invite = "Choisissez une démarche";
  if (etat === "chargement") invite = "Chargement des démarches…";
  if (etat === "erreur") invite = "Liste indisponible pour le moment";

  return (
    <div className="mt-9 max-w-xl">
      <label htmlFor={idListe} className="block font-bold text-encre">
        Quelle démarche cherchez-vous{" "}?
      </label>
      <div className="relative mt-3">
        <select
          id={idListe}
          value={choix}
          onChange={(e) => setChoix(e.target.value)}
          disabled={etat !== "pret"}
          className={`${classeChamp} cursor-pointer appearance-none pr-14 disabled:cursor-wait disabled:text-gris`}
        >
          <option value="" disabled>
            {invite}
          </option>
          {groupes.map(({ admin, demarches: liste }) => (
            <optgroup key={admin.id} label={[admin.nom, admin.ville].filter(Boolean).join(", ")}>
              {liste.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nom} ({d.duree_minutes} min)
                </option>
              ))}
            </optgroup>
          ))}
          <option value={AUTRE}>Autre démarche (saisie libre)</option>
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-sceau-vert"
        />
      </div>

      {adminChoisie && (
        <p className="mt-3 text-sm text-gris">
          À {[adminChoisie.nom, adminChoisie.ville].filter(Boolean).join(", ")}, prévoir {demarcheChoisie.duree_minutes} minutes sur place.
        </p>
      )}

      {etat === "erreur" && (
        <p className="mt-3 text-sm text-gris">
          Vous pouvez quand même choisir une administration dans la liste plus bas.
        </p>
      )}

      {saisieLibre && (
        <div className="mt-5">
          <label htmlFor={idChamp} className="block font-bold text-encre">
            Décrivez votre démarche
          </label>
          <div className="relative">
            <input
              id={idChamp}
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setRecherche("")}
              placeholder="Passeport, casier judiciaire…"
              autoComplete="off"
              autoFocus
              aria-describedby={idStatut}
              className={`${classeChamp} mt-3 placeholder:text-gris`}
            />

            {resultats.length > 0 && (
              <ul className="mt-3 overflow-hidden rounded-2xl border border-encre/10 bg-white lg:absolute lg:inset-x-0 lg:top-full lg:z-20 lg:mt-2 lg:shadow-xl lg:shadow-encre/10">
                {resultats.slice(0, NB_RESULTATS).map((d) => {
                  const admin = parId.get(d.administration);
                  return (
                    <li key={d.id} className="border-t border-encre/10 first:border-t-0">
                      <Link
                        to={`/demarches/${d.id}/creneau`}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-sceau-jaune/15 focus-visible:bg-sceau-jaune/15 focus-visible:-outline-offset-4"
                      >
                        <span>
                          <span className="block font-bold text-encre">{d.nom}</span>
                          <span className="block text-sm text-gris">
                            {[admin?.nom, admin?.ville].filter(Boolean).join(", ")}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm text-gris">{d.duree_minutes} min</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p id={idStatut} role="status" className="mt-3 text-sm text-gris empty:mt-0">
            {statutAnnonce}
          </p>

          {actif && resultats.length === 0 && statutAnnonce && (
            <Link to="/administrations" className="lien-souligne mt-1 inline-block text-sm font-bold text-sceau-vert">
              Parcourir les administrations
            </Link>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          to={demarcheChoisie ? `/demarches/${demarcheChoisie.id}/creneau` : "/administrations"}
          className="inline-flex h-14 items-center rounded-full bg-sceau-vert px-8 font-bold text-papier transition-colors hover:bg-encre"
        >
          {demarcheChoisie ? "Choisir mon créneau" : "Prendre rendez-vous"}
        </Link>
        <p className="text-sm text-gris">Gratuit, confirmation par email.</p>
      </div>
    </div>
  );
}

export default RechercheDemarche;
