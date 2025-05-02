export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  sexe: string;
  telephone: string;
  email: string;
  password: string;
  role: string;
  typeParent?: "PERE" | "MERE" | "TUTEUR";
  lieuResidence?: string;
  ine?: string;
  titreEtudiant?: "ETUDIANT_SIMPLE" | "ETUDIANT_DELEDUE";
  parentId?: string;
  filiereId?: string;
  matricule?: string;
  typeEnseignant?: "PERMANENT" | "VACATAIRE";
  grade?: string;
  specialite?: string;
  typeAdmin?: "COORDONATEUR" | "SCOLARITE";
}

export interface AuthResponse {
  token: string;
  type: string;
  refreshToken: string;
  id: string;
  email: string;
  nom: string;
  prenom: string;
  statutCompte: "ACTIVE" | "INACTIF" | "BLOQUE" | "EN_ATTENTE";
  roles: string[];
}
