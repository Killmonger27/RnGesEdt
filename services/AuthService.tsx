import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegisterRequest } from "@/interfaces/Authentification";

const API_BASE_URL = "http://192.168.1.80:8086/api"; // Remplacez par votre URL

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token aux requêtes
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Login error:", error.response?.data || error.message);
    } else {
      console.error("Login error:", error);
    }
    throw error;
  }
};

export const register = async (userData: RegisterRequest) => {
  try {
    console.log(userData);
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
    } else {
      console.error("Registration error:", error);
    }
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
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

export default axiosInstance;
