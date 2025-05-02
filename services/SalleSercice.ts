import { Salle } from "@/interfaces/Shared";
import axiosInstance from "./AuthService";
import axios from "axios";
/**
 * Récupère toutes les salles d'un filière
 * @returns Liste des salles
 */
export const getSalles = async (): Promise<Salle[]> => {
  try {
    const response = await axiosInstance.get(`/salle`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Erreur lors de la récupération des salles:",
        error.response?.data || error.message
      );
    } else {
      console.error("Erreur lors de la récupération des salles:", error);
    }
    throw error;
  }
};
