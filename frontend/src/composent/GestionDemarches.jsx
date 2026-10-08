import { useId, useRef, useState } from "react";
import { ClipboardList, Loader2, Pencil, Plus } from "lucide-react";
import { creerDemarcheAgent, modifierDemarcheAgent } from "../services/api";

const VIDE = { nom: "", duree_minutes: 30, description: "" };

const classeChamp =
  "w-full rounded-xl border border-[#BFD8D1] bg-white px-4 py-2.5 text-sm text-[#14352D] focus:border-[#057A58] focus:outline-none focus:ring-2 focus:ring-[#057A58]/20";

// Rubrique « Démarches » de l'espace agent : les démarches que les citoyens
// peuvent réserver auprès de l'administration de l'agent. L'agent peut en
// ajouter, les modifier, les suspendre ou les réactiver (jamais les supprimer :
// leurs rendez-vous doivent rester dans l'historique).
function GestionDemarches({ demarches, etat, onMiseAJour, onRecharger }) {
  const [formulaire, setFormulaire] = useState(null);
  const [valeurs, setValeurs] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [enCours, setEnCours] = useState(null);
  const [message, setMessage] = useState(null);
  const idNom = useId();
  const idDuree = useId();
  const idDescription = useId();
  const titreRef = useRef(null);
  const nomRef = useRef(null);
  const dureeRef = useRef(null);

  // Après fermeture du formulaire, le focus revient sur le titre de la rubrique
  // (le bouton qui l'avait ouvert peut avoir disparu entre-temps).
  const rendreLeFocus = () => requestAnimationFrame(() => titreRef.current?.focus());

  const ouvrir = (demarche) => {
    setMessage(null);
    setErreurs({});
    setFormulaire(demarche ? { mode: "modification", id: demarche.id } : { mode: "ajout" });
    setValeurs(
      demarche
        ? { nom: demarche.nom, duree_minutes: demarche.duree_minutes, description: demarche.description || "" }
        : VIDE
    );
  };

  const fermer = () => {
    setFormulaire(null);
    setErreurs({});
    rendreLeFocus();
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreurs({});
    const donnees = { ...valeurs, nom: valeurs.nom.trim(), duree_minutes: Number(valeurs.duree_minutes) };

    try {
      const demarche =
        formulaire.mode === "ajout"
          ? await creerDemarcheAgent(donnees)
          : await modifierDemarcheAgent(formulaire.id, donnees);
      onMiseAJour(demarche);
      setMessage({
        type: "succes",
        texte:
          formulaire.mode === "ajout"
            ? `« ${demarche.nom} » est ajoutée et proposée aux citoyens.`
            : `Modifications enregistrées pour « ${demarche.nom} ».`,
      });
      setFormulaire(null);
      rendreLeFocus();
    } catch (err) {
      // Erreurs par champ si l'API en donne ; sinon un message général (serveur indisponible…).
      const champs = err.champs || {};
      if (champs.nom || champs.duree_minutes) {
        setErreurs(champs);
        requestAnimationFrame(() => (champs.nom ? nomRef : dureeRef).current?.focus());
      } else {
        setErreurs({ general: [err.message] });
      }
    } finally {
      setEnvoi(false);
    }
  };

  const basculer = async (demarche) => {
    setEnCours(demarche.id);
    setMessage(null);
    try {
      const misAJour = await modifierDemarcheAgent(demarche.id, { actif: !demarche.actif });
      onMiseAJour(misAJour);
      setMessage({
        type: "succes",
        texte: misAJour.actif
          ? `« ${misAJour.nom} » est de nouveau proposée aux citoyens.`
          : `« ${misAJour.nom} » est suspendue : les citoyens ne peuvent plus la réserver. Les rendez-vous déjà pris sont conservés.`,
      });
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    } finally {
      setEnCours(null);
    }
  };

  const idErreur = (champ) => `${idNom}-erreur-${champ}`;
  const erreurChamp = (champ) =>
    erreurs[champ] && (
      <p id={idErreur(champ)} className="mt-1.5 text-xs font-semibold text-red-600">
        {erreurs[champ].join(" ")}
      </p>
    );

  return (
    <section className="overflow-hidden rounded-3xl border border-[#DDEBE8] bg-white shadow-[0_12px_35px_rgba(17,89,72,0.06)]">
      <div className="flex flex-col gap-4 border-b border-[#E5EFED] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2F8F2] text-[#067A57]">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h3 ref={titreRef} tabIndex={-1} className="text-lg font-extrabold text-[#075C3C] focus:outline-none">
              Démarches
            </h3>
            <p className="text-xs text-[#76918A]">
              Les démarches que les citoyens peuvent réserver auprès de votre administration.
            </p>
          </div>
        </div>

        {!formulaire && etat === "pret" && (
          <button
            type="button"
            onClick={() => ouvrir(null)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#057A58] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#046B4D]"
          >
            <Plus className="h-4 w-4" />
            Ajouter une démarche
          </button>
        )}
      </div>

      <p
        role="status"
        className={
          message
            ? `px-5 pt-4 text-sm font-semibold sm:px-7 ${message.type === "erreur" ? "text-red-600" : "text-[#057A58]"}`
            : "sr-only"
        }
      >
        {message?.texte}
      </p>

      {formulaire && (
        <form
          key={formulaire.id ?? "ajout"}
          onSubmit={enregistrer}
          noValidate
          className="m-5 rounded-2xl border border-[#DDEBE8] bg-[#F8FCFB] p-5 sm:m-7"
        >
          <h4 className="font-bold text-[#075C3C]">
            {formulaire.mode === "ajout" ? "Nouvelle démarche" : "Modifier la démarche"}
          </h4>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_12rem]">
            <div>
              <label htmlFor={idNom} className="mb-1.5 block text-sm font-semibold text-[#1A4D40]">
                Nom de la démarche
              </label>
              <input
                id={idNom}
                value={valeurs.nom}
                onChange={(e) => setValeurs({ ...valeurs, nom: e.target.value })}
                placeholder="Ex. : Carte d'identité"
                maxLength={100}
                autoFocus
                ref={nomRef}
                aria-invalid={Boolean(erreurs.nom)}
                aria-describedby={erreurs.nom ? idErreur("nom") : undefined}
                className={classeChamp}
              />
              {erreurChamp("nom")}
            </div>

            <div>
              <label htmlFor={idDuree} className="mb-1.5 block text-sm font-semibold text-[#1A4D40]">
                Durée sur place
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={idDuree}
                  type="number"
                  min={5}
                  max={240}
                  step={5}
                  value={valeurs.duree_minutes}
                  onChange={(e) => setValeurs({ ...valeurs, duree_minutes: e.target.value })}
                  ref={dureeRef}
                  aria-invalid={Boolean(erreurs.duree_minutes)}
                  aria-describedby={erreurs.duree_minutes ? idErreur("duree_minutes") : undefined}
                  className={classeChamp}
                />
                <span className="text-sm text-[#52746B]">min</span>
              </div>
              {erreurChamp("duree_minutes")}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor={idDescription} className="mb-1.5 block text-sm font-semibold text-[#1A4D40]">
              Description <span className="font-normal text-[#76918A]">(facultatif, visible par les citoyens)</span>
            </label>
            <textarea
              id={idDescription}
              rows={3}
              value={valeurs.description}
              onChange={(e) => setValeurs({ ...valeurs, description: e.target.value })}
              placeholder="Pièces à apporter, informations utiles…"
              className={classeChamp}
            />
          </div>

          {erreurChamp("general")}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={envoi}
              className="inline-flex items-center gap-2 rounded-xl bg-[#057A58] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#046B4D] disabled:cursor-wait disabled:opacity-60"
            >
              {envoi && <Loader2 className="h-4 w-4 animate-spin" />}
              {formulaire.mode === "ajout" ? "Ajouter la démarche" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={fermer}
              disabled={envoi}
              className="rounded-xl border disabled:cursor-wait disabled:opacity-60 border-[#D9E9E5] bg-white px-5 py-2.5 text-sm font-semibold text-[#52746B] transition hover:border-[#08A99B]"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {etat === "chargement" && (
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#66817A]">
          <Loader2 className="h-6 w-6 animate-spin text-[#08A99B]" />
          Chargement des démarches…
        </div>
      )}

      {etat === "erreur" && (
        <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-16 text-center">
          <p className="font-semibold text-[#1B5444]">La liste des démarches n'a pas pu être chargée.</p>
          <button
            type="button"
            onClick={onRecharger}
            className="rounded-xl border border-[#D9E9E5] px-4 py-2 text-sm font-semibold text-[#057A58] hover:border-[#08A99B]"
          >
            Réessayer
          </button>
        </div>
      )}

      {etat === "pret" && demarches.length === 0 && !formulaire && (
        <div className="px-6 py-16 text-center">
          <p className="font-semibold text-[#1B5444]">Aucune démarche pour le moment</p>
          <p className="mt-1 text-sm text-[#76918A]">
            Ajoutez la première démarche que les citoyens pourront réserver.
          </p>
        </div>
      )}

      {etat === "pret" && demarches.length > 0 && (
        <ul className="divide-y divide-[#E5EFED]">
          {demarches.map((demarche) => (
            <li key={demarche.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className={`font-bold ${demarche.actif ? "text-[#164E3F]" : "text-[#78918A]"}`}>{demarche.nom}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                      demarche.actif
                        ? "border-[#BFE7D3] bg-[#E9F8F0] text-[#087A4C]"
                        : "border-[#DCE3E1] bg-[#F2F5F4] text-[#66817A]"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {demarche.actif ? "Proposée aux citoyens" : "Suspendue"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-[#52746B]">{demarche.duree_minutes} min sur place</p>
                {demarche.description && (
                  <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-[#78918A]">{demarche.description}</p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => ouvrir(demarche)}
                  disabled={envoi}
                  className="disabled:cursor-wait disabled:opacity-60 inline-flex items-center gap-2 rounded-lg border border-[#D9E9E5] bg-white px-3 py-2 text-xs font-bold text-[#057A58] transition hover:border-[#08A99B]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => basculer(demarche)}
                  disabled={envoi || enCours === demarche.id}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                    demarche.actif
                      ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                      : "bg-[#057A58] text-white hover:bg-[#046B4D]"
                  }`}
                >
                  {enCours === demarche.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {demarche.actif ? "Suspendre" : "Réactiver"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default GestionDemarches;
