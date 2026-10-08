import { useId } from "react";
import batiment from "../assets/batiment.webp";

const VERT = "#025428";
const JAUNE = "#FCCA02";
const PAPIER = "#F7F5EF";

// Sceau AGSP redessiné en SVG à partir du logo d'origine (mêmes couleurs,
// même bâtiment). Les textes suivent les arcs pour rester lisibles à
// l'endroit : « République du Congo » en haut, « Service public • AGSP » en bas.
// Les deux textes couvrent le même angle (environ 135°) malgré des rayons différents.
//
// - complet={false} : version sans texte (anneaux + bâtiment), pour les petites
//   tailles où le texte serait illisible (barre de navigation, pied de page).
// - tournant : les pointillés extérieurs tournent lentement (page d'accueil).
// - label : description pour les lecteurs d'écran ; sans label, le sceau est décoratif.
function SceauAGSP({ complet = true, tournant = false, label, className = "" }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const accessibilite = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  if (!complet) {
    return (
      <svg viewBox="0 0 400 400" className={className} {...accessibilite} focusable="false">
        <circle cx="200" cy="200" r="196" fill={VERT} />
        <circle cx="200" cy="200" r="163" fill={JAUNE} />
        <circle cx="200" cy="200" r="146" fill={PAPIER} />
        <image href={batiment} x="102" y="101" width="196" height="199" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 400" className={className} {...accessibilite} focusable="false">
      <defs>
        <path id={`${id}-haut`} d="M 72 200 A 128 128 0 0 1 328 200" />
        <path id={`${id}-bas`} d="M 60 200 A 140 140 0 0 0 340 200" />
      </defs>

      <circle
        className={tournant ? "sceau-points" : undefined}
        cx="200"
        cy="200"
        r="189"
        fill="none"
        stroke={VERT}
        strokeWidth="5.5"
        strokeLinecap="round"
        pathLength="96"
        strokeDasharray="0 1"
      />
      <circle cx="200" cy="200" r="177" fill={VERT} />
      <circle cx="200" cy="200" r="170" fill={JAUNE} />
      <circle cx="200" cy="200" r="165.5" fill={PAPIER} />

      <g fill={VERT} style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "17px" }}>
        <text>
          <textPath href={`#${id}-haut`} startOffset="50%" textAnchor="middle" textLength="300" lengthAdjust="spacing">
            RÉPUBLIQUE DU CONGO
          </textPath>
        </text>
        <text>
          <textPath href={`#${id}-bas`} startOffset="50%" textAnchor="middle" textLength="330" lengthAdjust="spacing">
            SERVICE PUBLIC • AGSP
          </textPath>
        </text>
      </g>
      <circle cx="66" cy="200" r="4.5" fill={VERT} />
      <circle cx="334" cy="200" r="4.5" fill={VERT} />

      <image href={batiment} x="148" y="104" width="104" height="106" />
      <text
        x="200"
        y="246"
        textAnchor="middle"
        fill="#3B4540"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "21px", letterSpacing: "2px" }}
      >
        Numérisation
      </text>
    </svg>
  );
}

export default SceauAGSP;
