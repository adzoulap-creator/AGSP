import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Bell,CalendarDays,CheckCircle2,ChevronDown,Clock3,
  FileText,FolderOpen,Hourglass,LayoutDashboard,
  Loader2,LogOut,Mail,Menu,MoreVertical,Search,Settings,UserRound,Users,XCircle,
} from "lucide-react";

import {
  getRendezVousAgent,
  confirmerRendezVous,
  annulerRendezVous,
} from "../services/api";

import logoAgsp from "../assets/logo.png";

const ONGLETS = [
  { cle: "en_attente", label: "En attente", couleur: "jaune" },
  { cle: "valide", label: "Confirmés", couleur: "vert" },
  { cle: "refuse", label: "Annulés", couleur: "rouge" },
];

const NAVIGATION = [
  { label: "Tableau de bord", icone: LayoutDashboard},
  { label: "Rendez-vous", icone: CalendarDays },
  { label: "Citoyens", icone: Users },
  { label: "Dossiers", icone: FolderOpen },
];

function TableauDeBord() {
  const nom = localStorage.getItem("agentNom") || "Agent";
  const [rendezVous, setRendezVous] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);
  const [ongletActif, setOngletActif] = useState("en_attente");
  const [recherche, setRecherche] = useState("");
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);
  const [vueActive, setVueActive] = useState("Tableau de bord");
  const [periodeDossiers, setPeriodeDossiers] = useState("jour");

  useEffect(() => {
    chargerRendezVous();
  }, []);

  const chargerRendezVous = async () => {
    setChargement(true);
    setErreur(null);

    try {
      const data = await getRendezVousAgent();
      setRendezVous(Array.isArray(data) ? data : []);
    } catch (err) {
      setErreur(err.message || "Impossible de charger les rendez-vous.");
    } finally {
      setChargement(false);
    }
  };

  const gererConfirmer = async (rdvId) => {
    setEnCours(rdvId);
    setErreur(null);

    try {
      await confirmerRendezVous(rdvId);
      await chargerRendezVous();
      setOngletActif("valide");
    } catch (err) {
      setErreur(err.message || "Impossible de confirmer ce rendez-vous.");
    } finally {
      setEnCours(null);
    }
  };

  const gererAnnuler = async (rdvId) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment annuler ce rendez-vous ?"
    );

    if (!confirmation) return;

    setEnCours(rdvId);
    setErreur(null);

    try {
      await annulerRendezVous(rdvId);
      await chargerRendezVous();
      setOngletActif("refuse");
    } catch (err) {
      setErreur(err.message || "Impossible d'annuler ce rendez-vous.");
    } finally {
      setEnCours(null);
    }
  };


  const statistiques = useMemo(() => {
    const aujourdHui = new Date().toISOString().slice(0, 10);

    const total = rendezVous.filter((rdv) => rdv.date === aujourdHui).length;

    const enAttente = rendezVous.filter(
      (rdv) => rdv.statut === "en_attente"
    ).length;

    const confirmes = rendezVous.filter(
      (rdv) => rdv.statut === "valide"
    ).length;

    const annules = rendezVous.filter(
      (rdv) => rdv.statut === "refuse"
    ).length;

    return {
      total,
      enAttente,
      confirmes,
      annules,
    };
  }, [rendezVous]);



  const rendezVousFiltres = useMemo(() => {
    return rendezVous.filter((rdv) => {
      const correspondAuStatut = rdv.statut === ongletActif;

      const texte = `${rdv.prenom || ""} ${rdv.nom || ""} ${
        rdv.demarche || ""
      } ${rdv.date || ""}`.toLowerCase();

      const correspondRecherche = texte.includes(recherche.toLowerCase());

      return correspondAuStatut && correspondRecherche;
    });
  }, [rendezVous, ongletActif, recherche]);


  const formaterNom = (rdv) => {
    return `${rdv.prenom || ""} ${rdv.nom || ""}`.trim() || "Citoyen inconnu";
  };

  const initiales = (texte) => {
    return texte
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((mot) => mot[0])
      .join("")
      .toUpperCase();
  };

  const obtenirDebutSemaine = (date) => {
    const jour = date.getDay();
    const decalage = jour === 0 ? -6 : 1 - jour;
    const debut = new Date(date);
    debut.setDate(date.getDate() + decalage);
    debut.setHours(0, 0, 0, 0);
    return debut;
  };

  const citoyensUniques = useMemo(() => {
    const parEmail = new Map();

    rendezVous.forEach((rdv) => {
      const cle = rdv.email || `${rdv.nom}-${rdv.prenom}`;

      if (!parEmail.has(cle)) {
        parEmail.set(cle, {
          nom: formaterNom(rdv),
          email: rdv.email,
          telephone: rdv.telephone,
          nombreRdv: 0,
          derniereDemarche: rdv.demarche,
          derniereDate: rdv.date,
        });
      }

      const entree = parEmail.get(cle);
      entree.nombreRdv += 1;

      if (rdv.date > entree.derniereDate) {
        entree.derniereDemarche = rdv.demarche;
        entree.derniereDate = rdv.date;
      }
    });

    return Array.from(parEmail.values());
  }, [rendezVous]);  

  const rendezVousParPeriode = useMemo(() => {
    const maintenant = new Date();
    const aujourdHuiStr = maintenant.toISOString().slice(0, 10);

    if (periodeDossiers === "jour") {
      return rendezVous.filter((rdv) => rdv.date === aujourdHuiStr);
    }

    if (periodeDossiers === "semaine") {
      const debutSemaine = obtenirDebutSemaine(maintenant);
      const finSemaine = new Date(debutSemaine);
      finSemaine.setDate(debutSemaine.getDate() + 6);

      return rendezVous.filter((rdv) => {
        if (!rdv.date) return false;
        const dateRdv = new Date(rdv.date);
        return dateRdv >= debutSemaine && dateRdv <= finSemaine;
      });
    }

    const moisActuel = aujourdHuiStr.slice(0, 7);
    return rendezVous.filter(
      (rdv) => rdv.date && rdv.date.slice(0, 7) === moisActuel
    );
  }, [rendezVous, periodeDossiers]);


  const telechargerListePDF = () => {
    const document = new jsPDF();

    document.setFontSize(16);
    document.text("AGSP - Liste des rendez-vous", 14, 18);

    document.setFontSize(10);
    const libellePeriode = {
      jour: "Aujourd'hui",
      semaine: "Cette semaine",
      mois: "Ce mois",
    }[periodeDossiers];

    document.text(`Période : ${libellePeriode}`, 14, 26);
    document.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 32);

    const lignes = rendezVousParPeriode.map((rdv) => [
      formaterNom(rdv),
      rdv.demarche || "—",
      rdv.date || "—",
      rdv.heure || "—",
      obtenirBadgeStatut(rdv.statut).texte,
    ]);

    autoTable(document, {
      startY: 38,
      head: [["Citoyen", "Démarche", "Date", "Heure", "Statut"]],
      body: lignes,
      headStyles: { fillColor: [7, 122, 88] },
    });

    document.save(`rendez-vous-${periodeDossiers}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const obtenirBadgeStatut = (statut) => {
    const styles = {
      en_attente: {
        texte: "En attente",
        classe: "bg-[#FFF4D7] text-[#B77900] border-[#F7DEA0]",
      },
      valide: {
        texte: "Confirmé",
        classe: "bg-[#DCF7E7] text-[#08733D] border-[#B9ECCA]",
      },
      refuse: {
        texte: "Annulé",
        classe: "bg-[#FFE1E1] text-[#D52727] border-[#F8C0C0]",
      },
    };

    return styles[statut] || styles.en_attente;
  };

  const deconnexion = () => {
    localStorage.removeItem("agentToken");
    localStorage.removeItem("agentNom");
    window.location.href = "/agent/connexion";
  };

  return (
    <div className="min-h-screen bg-[#EEF8F8] text-[#14352D]">
      <div className="flex min-h-screen">

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col justify-between overflow-hidden bg-gradient-to-b from-[#14A876] via-[#0F9165] to-[#0C7A54] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
            menuMobileOuvert ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[#16B8B4]/15" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#F5C518]/10" />
          <div>
            <div className="relative z-10 border-b border-white/10 px-6 pb-5 pt-7">
              <div className="flex flex-col items-center gap-3 text-center">
                <img
                    src={logoAgsp}
                    alt="Sceau AGSP - République du Congo"
                    className="w-25 h-25 mx-auto animate-[float_2s_ease-in-out_infinite]"
                />
                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-20px); }
                    }
                `}</style>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    AGSP
                  </h1>
                  <p className="text-sm font-semibold leading-4 text-white/90">
                    Service Public Numérique
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    République du Congo
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <nav className="relative z-10 px-4 py-7">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                Navigation
              </p>

              <div className="space-y-2">
                {NAVIGATION.map((element) => {
                  const Icone = element.icone;
                  const estActif = vueActive === element.label;

                  return (
                    <button
                      key={element.label}
                      type="button"
                      onClick={() => setVueActive(element.label)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                        estActif
                          ? "bg-[#08A99B] text-white shadow-lg shadow-black/10"
                          : "text-white/85 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icone className="h-5 w-5 shrink-0" />
                      <span className="flex-1">{element.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="relative z-10 border-t border-white/10 px-6 py-6">
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="flex h-full w-full">
                <span className="w-1/3 bg-[#079447]" />
                <span className="w-1/3 bg-[#F7D548]" />
                <span className="w-1/3 bg-[#EA3B3B]" />
              </div>
            </div>

            <button
              type="button"
              onClick={deconnexion}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white hover:text-[#075C3C]"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </aside>

        {menuMobileOuvert && (
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMenuMobileOuvert(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}


        <main className="min-w-0 flex-1 lg:ml-[260px]">

          <header className="sticky top-0 z-30 border-b border-[#DDEDEC] bg-white/90 backdrop-blur-md">
            <div className="flex min-h-[92px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-9">
              <button
                type="button"
                onClick={() => setMenuMobileOuvert(true)}
                className="rounded-xl border border-[#DCE9E5] p-2 text-[#075C3C] lg:hidden">
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden min-w-[210px] lg:block">
                <p className="text-2xl font-extrabold tracking-tight text-[#075C3C]">
                  AGSP
                </p>
                <p className="text-xs font-semibold text-[#1A4D40]">
                  Service Public Numérique
                </p>
                <p className="text-[11px] text-[#6C8580]">
                  République du Congo
                </p>
              </div>

              <div className="relative ml-auto w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#537C72]" />

                <input
                  type="search"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher un citoyen, un dossier, un service..."
                  className="w-full rounded-full border border-[#D9E8E5] bg-[#F9FCFC] py-3 pl-12 pr-4 text-sm text-[#14352D] outline-none transition placeholder:text-[#91A5A0] focus:border-[#08A99B] focus:bg-white focus:ring-4 focus:ring-[#08A99B]/10"
                />
              </div>


              <div className="hidden items-center gap-3 rounded-full bg-[#F3FAF9] py-1.5 pl-1.5 pr-4 sm:flex">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0A8B62] to-[#12BFC2] text-sm font-bold text-white">
                  {initiales(nom)}
                </div>

                <div className="max-w-[150px]">
                  <p className="truncate text-sm font-bold text-[#075C3C]">
                    {nom}
                  </p>
                </div>

              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-9">
            {vueActive === "Tableau de bord" && (
            <section className="mb-7">

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0D4F3C] sm:text-3xl">
                Bienvenu Agent, {nom}
              </h2>

              <p className="mt-2 text-sm text-[#66817A]">
                Voici un aperçu de vos rendez-vous et de votre activité.
              </p>
            </section>
            )}

            {erreur && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Une erreur est survenue</p>
                  <p className="mt-1 text-sm">{erreur}</p>
                </div>
              </div>
            )}

            {vueActive === "Tableau de bord" && (
              <section className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <CarteStatistique
                  titre="Rendez-vous aujourd'hui"
                  valeur={statistiques.total}
                  variation="positive"
                  icone={CalendarDays}
                  couleur="vert"
                />

                <CarteStatistique
                  titre="En attente"
                  valeur={statistiques.enAttente}
                  texte="À traiter rapidement"
                  variation="attention"
                  icone={Clock3}
                  couleur="turquoise"
                />

                <CarteStatistique
                  titre="Confirmés"
                  valeur={statistiques.confirmes}
                  texte="Rendez-vous validés"
                  variation="positive"
                  icone={CheckCircle2}
                  couleur="vert"
                />

                <CarteStatistique
                  titre="Annulés"
                  valeur={statistiques.annules}
                  texte="Rendez-vous refusés"
                  variation="negative"
                  icone={Hourglass}
                  couleur="bleu"
                />
              </section>
            )}

            {(vueActive === "Tableau de bord" || vueActive === "Rendez-vous") && (
              <section className="overflow-hidden rounded-3xl border border-[#DDEBE8] bg-white shadow-[0_12px_35px_rgba(17,89,72,0.06)]">
                <div className="flex flex-col gap-4 border-b border-[#E5EFED] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2F8F2] text-[#067A57]">
                      <CalendarDays className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-[#075C3C]">
                        Prochains rendez-vous
                      </h3>
                      <p className="text-xs text-[#76918A]">
                        Gérez les demandes de rendez-vous des citoyens.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={chargerRendezVous}
                    className="rounded-xl border border-[#BFE3DA] px-4 py-2 text-sm font-semibold text-[#087A5B] transition hover:bg-[#EFFAF7]"
                  >
                    Actualiser
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-[#E5EFED] px-5 py-4 sm:px-7">
                  {ONGLETS.map((onglet) => {
                    const nombre = rendezVous.filter(
                      (rdv) => rdv.statut === onglet.cle
                    ).length;

                    const actif = ongletActif === onglet.cle;

                    return (
                      <button
                        key={onglet.cle}
                        type="button"
                        onClick={() => setOngletActif(onglet.cle)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          actif
                            ? "bg-[#057A58] text-white shadow-md shadow-[#057A58]/20"
                            : "border border-[#D9E9E5] bg-[#F8FCFB] text-[#52746B] hover:border-[#08A99B] hover:text-[#057A58]"
                        }`}
                      >
                        {onglet.label}
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                            actif
                              ? "bg-white/20 text-white"
                              : "bg-[#E3F2EE] text-[#397263]"
                          }`}
                        >
                          {nombre}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {chargement ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-9 w-9 animate-spin text-[#08A99B]" />
                    <p className="mt-4 text-sm text-[#66817A]">
                      Chargement des rendez-vous…
                    </p>
                  </div>
                ) : rendezVousFiltres.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF8F6] text-[#087A5B]">
                      <CalendarDays className="h-7 w-7" />
                    </div>

                    <p className="mt-4 font-semibold text-[#1B5444]">
                      Aucun rendez-vous trouvé
                    </p>

                    <p className="mt-1 text-sm text-[#76918A]">
                      Aucun rendez-vous ne correspond à cette catégorie.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left">
                      <thead className="bg-[#EDF8F7] text-xs font-bold uppercase tracking-wide text-[#397263]">
                        <tr>
                          <th className="px-6 py-4">Citoyen</th>
                          <th className="px-6 py-4">Démarche</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Heure</th>
                          <th className="px-6 py-4">Statut</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#E5EFED]">
                        {rendezVousFiltres.map((rdv) => {
                          const nomComplet = formaterNom(rdv);
                          const badge = obtenirBadgeStatut(rdv.statut);
                          const traitement = enCours === rdv.id;

                          return (
                            <tr
                              key={rdv.id}
                              className="transition hover:bg-[#F8FCFB]"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0B8B68] to-[#12BFC2] text-xs font-bold text-white">
                                    {initiales(nomComplet)}
                                  </div>

                                  <div>
                                    <p className="font-semibold text-[#164E3F]">
                                      {nomComplet}
                                    </p>
                                    <p className="text-xs text-[#78918A]">
                                      Citoyen
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-[#385C52]">
                                  <FileText className="h-4 w-4 text-[#08A99B]" />
                                  {rdv.demarche || "Non précisée"}
                                </div>
                              </td>

                              <td className="px-6 py-4 text-sm text-[#45675E]">
                                {rdv.date || "—"}
                              </td>

                              <td className="px-6 py-4 text-sm text-[#45675E]">
                                {rdv.heure || "—"}
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${badge.classe}`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                  {badge.texte}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                {rdv.statut === "en_attente" ? (
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => gererConfirmer(rdv.id)}
                                      disabled={traitement}
                                      className="inline-flex items-center gap-2 rounded-lg bg-[#057A58] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#046B4D] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {traitement ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                      )}
                                      Confirmer
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => gererAnnuler(rdv.id)}
                                      disabled={traitement}
                                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      <XCircle className="h-4 w-4" />
                                      Annuler
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      className="rounded-lg p-2 text-[#50736A] transition hover:bg-[#EAF6F3] hover:text-[#057A58]"
                                      aria-label="Plus d'actions"
                                    >
                                      <MoreVertical className="h-5 w-5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {vueActive === "Citoyens" && (
              <section className="overflow-hidden rounded-3xl border border-[#DDEBE8] bg-white shadow-[0_12px_35px_rgba(17,89,72,0.06)]">
                <div className="flex items-center gap-3 border-b border-[#E5EFED] px-5 py-5 sm:px-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2F8F2] text-[#067A57]">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#075C3C]">Citoyens</h3>
                    <p className="text-xs text-[#76918A]">
                      Toutes les personnes ayant déjà pris rendez-vous.
                    </p>
                  </div>
                </div>

                {citoyensUniques.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <p className="font-semibold text-[#1B5444]">Aucun citoyen trouvé</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left">
                      <thead className="bg-[#EDF8F7] text-xs font-bold uppercase tracking-wide text-[#397263]">
                        <tr>
                          <th className="px-6 py-4">Citoyen</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Téléphone</th>
                          <th className="px-6 py-4">Rendez-vous</th>
                          <th className="px-6 py-4">Dernière démarche</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#E5EFED]">
                        {citoyensUniques.map((citoyen) => (
                          <tr key={citoyen.email || citoyen.nom} className="transition hover:bg-[#F8FCFB]">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0B8B68] to-[#12BFC2] text-xs font-bold text-white">
                                  {initiales(citoyen.nom)}
                                </div>
                                <p className="font-semibold text-[#164E3F]">{citoyen.nom}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#45675E]">{citoyen.email || "—"}</td>
                            <td className="px-6 py-4 text-sm text-[#45675E]">{citoyen.telephone || "—"}</td>
                            <td className="px-6 py-4 text-sm text-[#45675E]">{citoyen.nombreRdv}</td>
                            <td className="px-6 py-4 text-sm text-[#45675E]">{citoyen.derniereDemarche || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {vueActive === "Dossiers" && (
              <section className="overflow-hidden rounded-3xl border border-[#DDEBE8] bg-white shadow-[0_12px_35px_rgba(17,89,72,0.06)]">
                <div className="flex flex-col gap-4 border-b border-[#E5EFED] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2F8F2] text-[#067A57]">
                      <FolderOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#075C3C]">Dossiers</h3>
                      <p className="text-xs text-[#76918A]">
                        Consultez et exportez vos rendez-vous par période.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={telechargerListePDF}
                    className="rounded-xl bg-[#057A58] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#046B4D]"
                  >
                    Télécharger la liste (PDF)
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-[#E5EFED] px-5 py-4 sm:px-7">
                  {[
                    { cle: "jour", label: "Aujourd'hui" },
                    { cle: "semaine", label: "Cette semaine" },
                    { cle: "mois", label: "Ce mois" },
                  ].map((option) => (
                    <button
                      key={option.cle}
                      type="button"
                      onClick={() => setPeriodeDossiers(option.cle)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        periodeDossiers === option.cle
                          ? "bg-[#057A58] text-white shadow-md shadow-[#057A58]/20"
                          : "border border-[#D9E9E5] bg-[#F8FCFB] text-[#52746B] hover:border-[#08A99B] hover:text-[#057A58]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {rendezVousParPeriode.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <p className="font-semibold text-[#1B5444]">
                      Aucun rendez-vous sur cette période
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left">
                      <thead className="bg-[#EDF8F7] text-xs font-bold uppercase tracking-wide text-[#397263]">
                        <tr>
                          <th className="px-6 py-4">Citoyen</th>
                          <th className="px-6 py-4">Démarche</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Heure</th>
                          <th className="px-6 py-4">Statut</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#E5EFED]">
                        {rendezVousParPeriode.map((rdv) => {
                          const badge = obtenirBadgeStatut(rdv.statut);

                          return (
                            <tr key={rdv.id} className="transition hover:bg-[#F8FCFB]">
                              <td className="px-6 py-4 font-semibold text-[#164E3F]">
                                {formaterNom(rdv)}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#45675E]">
                                {rdv.demarche || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#45675E]">
                                {rdv.date || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#45675E]">
                                {rdv.heure || "—"}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${badge.classe}`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                  {badge.texte}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

function CarteStatistique({
  titre,
  valeur,
  texte,
  variation,
  icone: Icone,
  couleur,
}) {
  const couleurs = {
    vert: {
      fond: "bg-[#E0F7EC]",
      icone: "text-[#087A4C]",
      cercle: "bg-[#087A4C]",
    },
    turquoise: {
      fond: "bg-[#DDF7F8]",
      icone: "text-[#079CA5]",
      cercle: "bg-[#079CA5]",
    },
    bleu: {
      fond: "bg-[#E4F2FF]",
      icone: "text-[#2586CD]",
      cercle: "bg-[#2586CD]",
    },
  };

  const style = couleurs[couleur] || couleurs.vert;

  const styleVariation = {
    positive: "text-[#0B8A53]",
    attention: "text-[#C28713]",
    negative: "text-[#D84A4A]",
  };

  return (
    <article className="relative overflow-hidden rounded-3xl border border-[#DDEBE8] bg-white p-5 shadow-[0_12px_32px_rgba(13,92,70,0.05)]">
      <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-[#08A99B]/5" />

      <div className="relative flex items-start justify-between gap-3">
        <div className={`rounded-2xl p-3 ${style.fond} ${style.icone}`}>
          <Icone className="h-6 w-6" />
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${style.cercle} text-white opacity-10`}
        >
          <Icone className="h-5 w-5" />
        </div>
      </div>

      <div className="relative mt-5">
        <p className="text-sm font-bold text-[#25584B]">{titre}</p>

        <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#075C3C]">
          {valeur}
        </p>

        <p className={`mt-3 text-xs font-semibold ${styleVariation[variation]}`}>
          {texte}
        </p>
      </div>
    </article>
  );
}

export default TableauDeBord;