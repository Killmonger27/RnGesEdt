import axios from "axios";
import axiosInstance from "./AuthService";
import { Cours } from "@/interfaces/EDT";

// Fonction pour récupérer les cours d'un EDT
export const getCoursByEdt = async (
  edtId: string,
  filiereId: string
): Promise<Cours[]> => {
  try {
    const response = await axiosInstance.get<Cours[]>(
      `/cours/${edtId}/${filiereId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Erreur lors de la récupération des cours:",
        error.response?.data || error.message
      );
    } else {
      console.error("Erreur lors de la récupération des cours:", error);
    }
    throw error;
  }
};

// Fonction pour mettre à jour le statut d'un cours
export const updateCoursStatus = async (id: string) => {
  console.log("id", id);
};

// Fonction pour mettre à jour la disponibilité d'un cours
export const updateProfDisponibility = async (id: string) => {
  console.log("id", id);
};
