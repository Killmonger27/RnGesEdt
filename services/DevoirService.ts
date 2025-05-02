import axios from "axios";
import axiosInstance from "./AuthService";
import { Devoir } from "@/interfaces/EDT";

// Fonction pour récupérer les devoirs d'un EDT
export const getDevoirsByEdt = async (
  edtId: string,
  filiereId: string
): Promise<Devoir[]> => {
  try {
    const response = await axiosInstance.get<Devoir[]>(
      `/devoirs/${edtId}/${filiereId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Erreur lors de la récupération des devoirs:",
        error.response?.data || error.message
      );
    } else {
      console.error("Erreur lors de la récupération des devoirs:", error);
    }
    throw error;
  }
};
