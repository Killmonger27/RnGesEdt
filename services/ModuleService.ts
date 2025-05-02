import { Module } from "@/interfaces/Shared";
import axiosInstance from "./AuthService";
import axios from "axios";
/**
 * Récupère tous les modules d'un filière
 * @returns Liste des modules
 */
export const getModules = async (): Promise<Module[]> => {
  try {
    const response = await axiosInstance.get(`/matiere`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Erreur lors de la récupération des modules:",
        error.response?.data || error.message
      );
    } else {
      console.error("Erreur lors de la récupération des modules:", error);
    }
    throw error;
  }
};
