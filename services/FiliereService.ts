import { Filiere } from "@/interfaces/Shared";
import axiosInstance from "./AuthService";
import axios from "axios";
/**
 * Récupère toutes les filières
 * @returns Liste des filières
 */
export const getFilieres = async (): Promise<Filiere[]> => {
  try {
    const response = await axiosInstance.get("/filiere");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Erreur lors de la récupération des filières:",
        error.response?.data || error.message
      );
    } else {
      console.error("Erreur lors de la récupération des filières:", error);
    }
    throw error;
  }
};
