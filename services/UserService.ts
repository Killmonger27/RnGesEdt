import axiosInstance from "./AuthService";
import axios from "axios";

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Get user profile error:",
        error.response?.data || error.message
      );
    } else {
      console.error("Get user profile error:", error);
    }
    throw error;
  }
};

export const getUserFiliere = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/users/filiere/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Get user filiere error:",
        error.response?.data || error.message
      );
    } else {
      console.error("Get user filiere error:", error);
    }
    throw error;
  }
};
