export interface Filiere {
  id: string;
  nomFiliere: string;
  description: string;
  niveau: "L1" | "L2" | "L3" | "M1" | "M2"; // Type plus strict pour respecter les enums sur le backend
}

export interface Module {
  id: string;
  intitule: string;
  volumeHoraire: number;
  semestre: "S1" | "S2" | "S3" | "S4" | "S5" | "S6";
  statutMatiere: "NON_DEBUTE" | "EN_COURS" | "TERMINE";
  idEnseignant: string;
  idFiliere: string;
}

export interface Salle {
  id: string;
  numeroSalle: string;
  disponibiliteSalle: "LIBRE" | "OCCUPEE";
}

export interface UserData {
  id: string;
  filiereId: string;
  filiereName: string;
  role: string;
}
