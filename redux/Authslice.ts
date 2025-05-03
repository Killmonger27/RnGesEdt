import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, register } from "@/services/AuthService";
import { LoginRequest, RegisterRequest } from "@/interfaces/Authentification";

interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userId: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// Thunk pour la connexion
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await login(credentials.email, credentials.password);

      // Stocker les tokens dans AsyncStorage
      await AsyncStorage.setItem("userToken", response.token);
      await AsyncStorage.setItem("userId", response.id);
      await AsyncStorage.setItem("refreshToken", response.refreshToken);

      return {
        token: response.token,
        userId: response.id,
        refreshToken: response.refreshToken,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Échec de la connexion"
      );
    }
  }
);

// Thunk pour l'inscription
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await register(userData);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Échec de l'inscription"
      );
    }
  }
);

// Thunk pour la déconnexion
export const signOut = createAsyncThunk("auth/signOut", async () => {
  // Supprimer les tokens de AsyncStorage
  await AsyncStorage.removeItem("userToken");
  await AsyncStorage.removeItem("userId");
  await AsyncStorage.removeItem("refreshToken");
  return null;
});

// Thunk pour vérifier l'authentification au démarrage
export const checkAuth = createAsyncThunk("auth/check", async () => {
  const token = await AsyncStorage.getItem("userToken");
  const userId = await AsyncStorage.getItem("userId");
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  if (token && userId) {
    return {
      token,
      userId,
      refreshToken,
    };
  }

  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Gestion de signIn
    builder.addCase(signIn.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Gestion de signUp
    builder.addCase(signUp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.isLoggedIn = false;
      state.token = null;
      state.userId = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Gestion de signOut
    builder.addCase(signOut.fulfilled, (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.userId = null;
      state.refreshToken = null;
    });

    // Gestion de checkAuth
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.isLoggedIn = true;
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.refreshToken = action.payload.refreshToken;
      } else {
        state.isLoggedIn = false;
      }
      state.loading = false;
    });
  },
});

export default authSlice.reducer;
