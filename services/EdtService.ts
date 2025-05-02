import axios from "axios";
import axiosInstance from "./AuthService";
import { Edt } from "@/interfaces/EDT";

// Fonction pour récupérer les EDT d'un filière
export const getPublishedEdts = async (filiereId: string): Promise<Edt[]> => {
  try {
    const response = await axiosInstance.get<Edt[]>(
      `/edt?recherche=${filiereId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Erreur lors de la récupération des EDT:",
        error.response?.data || error.message
      );
    } else {
      console.error("Erreur lors de la récupération des EDT:", error);
    }
    throw error;
  }
};
