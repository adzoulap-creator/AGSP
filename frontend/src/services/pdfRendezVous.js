import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Couleurs du sceau et du drapeau, en RVB pour jsPDF.
const VERT = [2, 84, 40];
const JAUNE = [252, 202, 2];
const ROUGE = [220, 36, 31];
const ENCRE = [20, 32, 28];
const GRIS = [91, 107, 98];
const PAPIER = [247, 245, 239];
const TRAIT = [221, 215, 199];
const BLANC = [255, 255, 255];

const STATUTS = {
  valide: { texte: "Confirmé", couleur: [11, 122, 62], fond: [225, 243, 232] },
  en_attente: { texte: "En attente", couleur: [154, 103, 0], fond: [253, 243, 212] },
  refuse: { texte: "Annulé", couleur: [197, 48, 48], fond: [252, 231, 231] },
};

const MARGE = 16;

// Les polices standard de jsPDF ne connaissent pas les espaces insécables
// que produit parfois toLocaleDateString : on les remplace par des espaces.
const propre = (texte) => String(texte).replace(/[\u00a0\u202f]/g, " ");
const capitaliser = (texte) => texte.charAt(0).toUpperCase() + texte.slice(1);
const dateFr = (date, options) => propre(date.toLocaleDateString("fr-FR", options));

const iso = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function lundiDeLaSemaine(date) {
  const lundi = new Date(date);
  const jour = lundi.getDay();
  lundi.setDate(lundi.getDate() + (jour === 0 ? -6 : 1 - jour));
  return lundi;
}

export function libellePeriode(periode, maintenant = new Date()) {
  if (periode === "jour") {
    return capitaliser(dateFr(maintenant, { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }
  if (periode === "semaine") {
    const debut = lundiDeLaSemaine(maintenant);
    const fin = new Date(debut);
    fin.setDate(debut.getDate() + 6);
    const debutTexte = debut.getMonth() === fin.getMonth()
      ? String(debut.getDate())
      : dateFr(debut, { day: "numeric", month: "long" });
    return `Semaine du ${debutTexte} au ${dateFr(fin, { day: "numeric", month: "long", year: "numeric" })}`;
  }
  return capitaliser(dateFr(maintenant, { month: "long", year: "numeric" }));
}

// « 2026-10-20 » devient « Mar. 20/10 », « 09:30:00 » devient « 9 h 30 ».
function formaterDate(iso) {
  if (!iso) return "—";
  const [annee, mois, jour] = iso.split("-").map(Number);
  const nomJour = dateFr(new Date(annee, mois - 1, jour), { weekday: "short" });
  return `${capitaliser(nomJour)} ${String(jour).padStart(2, "0")}/${String(mois).padStart(2, "0")}`;
}

function formaterHeure(heure) {
  if (!heure) return "—";
  const [h, m] = heure.split(":");
  return `${Number(h)} h ${m}`;
}

function bandeDrapeau(doc, largeur, hauteur) {
  [VERT, JAUNE, ROUGE].forEach((couleur, i) => {
    doc.setFillColor(...couleur);
    doc.rect((largeur / 3) * i, 0, largeur / 3 + 0.2, hauteur, "F");
  });
}

function pastilleStatut(doc, cellule, statut) {
  const s = STATUTS[statut] || { texte: statut || "—", couleur: GRIS, fond: PAPIER };
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const hauteur = 5.6;
  const largeur = doc.getTextWidth(s.texte) + 6;
  const x = cellule.x + 2.2;
  const y = cellule.y + (cellule.height - hauteur) / 2;
  doc.setFillColor(...s.fond);
  doc.roundedRect(x, y, largeur, hauteur, hauteur / 2, hauteur / 2, "F");
  doc.setTextColor(...s.couleur);
  doc.text(s.texte, x + 3, y + hauteur / 2, { baseline: "middle" });
}

// « Carte d'identité » devient « carte-d-identite » (pour le nom du fichier).
const versSlug = (texte) =>
  texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Génère la liste des rendez-vous d'une démarche sur une période et renvoie
// le document avec un nom de fichier ; l'appelant décide de l'enregistrer.
// Le document est toujours centré sur la démarche : c'est son titre principal.
export function genererPdfRendezVous({ rendezVous, demarche, administration, periode, logo, maintenant = new Date() }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const largeur = doc.internal.pageSize.getWidth();
  const hauteur = doc.internal.pageSize.getHeight();
  const periodeTexte = libellePeriode(periode, maintenant);
  const genereLe = `${dateFr(maintenant, { day: "numeric", month: "long", year: "numeric" })} à ${propre(
    maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  )}`;
  const nomDemarche = demarche || "Démarche non précisée";
  const nomAdministration = administration
    ? [administration.nom, administration.ville].filter(Boolean).join(", ")
    : "";
  const tries = [...rendezVous].sort((a, b) => `${a.date} ${a.heure}`.localeCompare(`${b.date} ${b.heure}`));

  doc.setProperties({ title: `${nomDemarche}, rendez-vous, ${periodeTexte}`, author: "AGSP", creator: "AGSP" });

  // En-tête : bande du drapeau, sceau, nom de l'application, et à droite qui a généré le document et quand.
  bandeDrapeau(doc, largeur, 3);
  if (logo) doc.addImage(logo, "PNG", MARGE, 11, 19, 19);
  const xNom = MARGE + (logo ? 24 : 0);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...VERT);
  doc.text("AGSP", xNom, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...ENCRE);
  doc.text("Application de Gestion des Services Publics", xNom, 24.5);
  doc.setTextColor(...GRIS);
  doc.text("République du Congo", xNom, 29);

  doc.setFontSize(8.5);
  doc.setTextColor(...GRIS);
  doc.text("Liste des rendez-vous", largeur - MARGE, 19, { align: "right" });
  doc.text(`Généré le ${genereLe}`, largeur - MARGE, 24.5, { align: "right" });

  doc.setDrawColor(...TRAIT);
  doc.setLineWidth(0.3);
  doc.line(MARGE, 36, largeur - MARGE, 36);

  // L'administration (le service public), puis la démarche en titre, puis la période.
  let yTitre = 55;
  if (nomAdministration) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...VERT);
    doc.text(propre(nomAdministration), MARGE, 46);
    yTitre = 60.5;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...GRIS);
  doc.text("Rendez-vous pour la démarche", MARGE, yTitre - 9);
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...ENCRE);
  const titre = doc.splitTextToSize(nomDemarche, largeur - 2 * MARGE);
  doc.text(titre, MARGE, yTitre);
  const yPeriode = yTitre + (titre.length - 1) * 9.5 + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...VERT);
  doc.text(periodeTexte, MARGE, yPeriode);

  // Résumé en quatre encadrés.
  const compter = (statut) => rendezVous.filter((r) => r.statut === statut).length;
  const cartes = [
    { libelle: "Rendez-vous", valeur: rendezVous.length, couleur: VERT },
    { libelle: "Confirmés", valeur: compter("valide"), couleur: STATUTS.valide.couleur },
    { libelle: "En attente", valeur: compter("en_attente"), couleur: STATUTS.en_attente.couleur },
    { libelle: "Annulés", valeur: compter("refuse"), couleur: STATUTS.refuse.couleur },
  ];
  const yCartes = yPeriode + 7;
  const hCarte = 17;
  const ecart = 4;
  const lCarte = (largeur - 2 * MARGE - 3 * ecart) / 4;
  cartes.forEach((carte, i) => {
    const x = MARGE + i * (lCarte + ecart);
    doc.setFillColor(...PAPIER);
    doc.roundedRect(x, yCartes, lCarte, hCarte, 2, 2, "F");
    doc.setFillColor(...carte.couleur);
    doc.roundedRect(x, yCartes + 3.5, 1.4, hCarte - 7, 0.7, 0.7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...carte.couleur);
    doc.text(String(carte.valeur), x + 5.5, yCartes + 8.8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRIS);
    doc.text(carte.libelle, x + 5.5, yCartes + 13.8);
  });

  const yTableau = yCartes + hCarte + 9;

  if (tries.length === 0) {
    doc.setFillColor(...PAPIER);
    doc.roundedRect(MARGE, yTableau, largeur - 2 * MARGE, 22, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...GRIS);
    doc.text("Aucun rendez-vous pour cette démarche sur cette période.", largeur / 2, yTableau + 11, { align: "center", baseline: "middle" });
  } else {
    autoTable(doc, {
      startY: yTableau,
      margin: { left: MARGE, right: MARGE, top: 22, bottom: 20 },
      head: [["Date", "Heure", "Citoyen", "Contact", "Statut"]],
      body: tries.map((r) => [
        formaterDate(r.date),
        formaterHeure(r.heure),
        `${r.prenom || ""} ${r.nom || ""}`.trim() || "Citoyen inconnu",
        [r.telephone, r.email].filter(Boolean).join("\n") || "—",
        r.statut,
      ]),
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 9,
        textColor: ENCRE,
        valign: "middle",
        cellPadding: { top: 2.8, bottom: 2.8, left: 2.2, right: 2.2 },
      },
      headStyles: { fillColor: VERT, textColor: BLANC, fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: PAPIER },
      // La colonne Contact est assez large pour qu'un email ne soit pas coupé en plein mot.
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 18 },
        2: { cellWidth: 46, fontStyle: "bold" },
        3: { fontSize: 8, textColor: GRIS },
        4: { cellWidth: 26 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) data.cell.text = [""];
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 4) pastilleStatut(doc, data.cell, data.cell.raw);
      },
    });
  }

  // Sur chaque page : pied de page avec la pagination ; à partir de la 2e, rappel de l'en-tête.
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    if (page > 1) {
      bandeDrapeau(doc, largeur, 3);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...VERT);
      doc.text("AGSP", MARGE, 13);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRIS);
      doc.text(`${nomAdministration ? `${nomAdministration} · ` : ""}${nomDemarche}, ${periodeTexte} (suite)`, MARGE + 11, 13);
    }
    doc.setDrawColor(...TRAIT);
    doc.setLineWidth(0.3);
    doc.line(MARGE, hauteur - 14, largeur - MARGE, hauteur - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    doc.text("AGSP · Application de Gestion des Services Publics · République du Congo", MARGE, hauteur - 9);
    doc.text(`Page ${page} / ${total}`, largeur - MARGE, hauteur - 9, { align: "right" });
  }

  const jourIso = iso(maintenant);
  const suffixe = { jour: jourIso, semaine: `semaine-du-${iso(lundiDeLaSemaine(maintenant))}`, mois: jourIso.slice(0, 7) }[periode] || jourIso;
  return { doc, nomFichier: `agsp-${versSlug(nomDemarche) || "demarche"}-${suffixe}.pdf` };
}
