import SceauAGSP from "./SceauAGSP";

// Le sceau AGSP posé sur la diagonale du drapeau. Seuls les pointillés
// extérieurs tournent : les textes restent toujours lisibles à l'endroit.
function SceauAnime() {
  return (
    <div className="sceau">
      <svg className="sceau-bande" viewBox="-2 -2 4 4" aria-hidden="true" focusable="false">
        <g>
          <rect x="-3" y="-0.37" width="6" height="0.17" fill="var(--color-sceau-vert)" />
          <rect x="-3" y="-0.2" width="6" height="0.4" fill="var(--color-sceau-jaune)" />
          <rect x="-3" y="0.2" width="6" height="0.17" fill="var(--color-rouge)" />
        </g>
      </svg>

      <div className="sceau-disque">
        <SceauAGSP
          tournant
          label="Sceau AGSP, République du Congo, service public"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

export default SceauAnime;
