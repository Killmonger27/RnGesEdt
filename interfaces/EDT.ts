export interface Cours {
  id: string;
  date: Date;
  crenau: "MATIN" | "SOIR";
  statutCours: "PLANIFIE" | "FAIT" | "NON_FAIT" | "ANNULE";
  disponibiliteProf: "DISPONIBLE" | "INDISPONIBLE";
  idSalle: string;
  idMatiere: string;
  idEmploiDuTemps: string;
}

export interface Edt {
  id: string;
  datePublication?: string;
  dateDebut: string;
  dateFin: string;
  statutEdt: "BROUILLON" | "CLOS" | "PUBLIE";
  idFiliere: string;
}

export interface Devoir {
  id: string;
  date: Date;
  crenau: "MATIN" | "SOIR";
  duree: number;
  statutDevoir: "FAIT" | "NON_FAIT" | "ANNULE";
  idSalle: string;
  idMatiere: string;
  idEmploiDuTemps: string;
}

export enum EStatutCours {
  PLANIFIE = "PLANIFIE",
  FAIT = "FAIT",
  NON_FAIT = "NON_FAIT",
  ANNULE = "ANNULE",
}

export enum EDisponibiliteProf {
  DISPONIBLE = "DISPONIBLE",
  INDISPONIBLE = "INDISPONIBLE",
}
