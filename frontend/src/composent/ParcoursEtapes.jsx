import { Check } from "lucide-react";
import "./parcoursEtapes.css";

const ETAPES = [
  { court: "Administration", long: "Choix de l'administration" },
  { court: "Démarche", long: "Choix de la démarche" },
  { court: "Créneau", long: "Choix du créneau" },
  { court: "Coordonnées", long: "Vos informations" },
  { court: "Confirmation", long: "Confirmation" },
];

const COULEURS_ECLAT = ["var(--color-sceau-vert)", "var(--color-sceau-jaune)", "var(--color-rouge)"];

// Indicateur d'étapes du parcours de réservation (étapes 1 à 5).
// À l'arrivée sur une page, la barre avance depuis l'étape précédente,
// l'étape qui vient d'être terminée trace sa coche et l'étape en cours apparaît.
function ParcoursEtapes({ etape }) {
  const total = ETAPES.length;
  const avancement = (n) => Math.max(0, n - 1) / (total - 1);

  return (
    <nav aria-label="Étapes de la prise de rendez-vous" className="parcours mx-auto max-w-4xl px-6 pt-10 pb-10">
      <p className="flex items-baseline gap-2">
        <span className="parcours-compteur font-titre text-4xl font-semibold leading-none text-sceau-vert" key={etape}>
          {etape}
        </span>
        <span className="text-sm text-gris">sur {total}</span>
        <span className="ml-2 font-bold text-encre">{ETAPES[etape - 1].long}</span>
      </p>

      <div className="relative mt-6" style={{ "--depart": avancement(etape - 1), "--arrivee": avancement(etape) }}>
        <div aria-hidden="true" className="parcours-piste">
          <span className="parcours-remplissage" />
        </div>

        <ol role="list" className="relative grid grid-cols-5">
          {ETAPES.map((e, i) => {
            const numero = i + 1;
            const fait = numero < etape;
            const enCours = numero === etape;
            const vientDEtreFait = numero === etape - 1;
            const classes = ["parcours-point"];
            if (fait) classes.push("parcours-point--fait");
            if (vientDEtreFait) classes.push("parcours-point--vient");
            if (enCours) classes.push("parcours-point--en-cours");

            return (
              <li key={e.court} className="relative flex flex-col items-center text-center" aria-current={enCours ? "step" : undefined}>
                <span aria-hidden="true" className={classes.join(" ")}>
                  {fait ? <Check aria-hidden="true" strokeWidth={3} className="h-5 w-5" /> : numero}
                  {enCours && numero === total &&
                    COULEURS_ECLAT.concat(COULEURS_ECLAT, COULEURS_ECLAT, COULEURS_ECLAT).map((couleur, j) => (
                      <span
                        key={j}
                        className="parcours-eclat"
                        style={{ "--angle": `${j * 30}deg`, background: couleur }}
                      />
                    ))}
                </span>
                <span aria-hidden="true" className={`mt-3 hidden text-sm sm:block ${enCours ? "font-bold text-encre" : "text-gris"}`}>
                  {e.court}
                </span>
                <span className="sr-only">
                  {`Étape ${numero}, ${e.long}${fait ? ", terminée" : enCours ? ", en cours" : ""}`}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export default ParcoursEtapes;
