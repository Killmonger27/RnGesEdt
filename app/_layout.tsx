import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { View } from "react-native";

// Maintenir le splash screen visible pendant que nous vérifions l'authentification
SplashScreen.preventAutoHideAsync();

// Contexte d'authentification
import { createContext } from "react";
interface AuthContextType {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoggedIn: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Vérifier l'état d'authentification
  useEffect(() => {
    async function prepare() {
      try {
        // Récupérer le token depuis AsyncStorage
        const token = await AsyncStorage.getItem("userToken");

        // Mettre à jour l'état d'authentification
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        setIsLoggedIn(false);
      } finally {
        // Marquer l'app comme prête
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Effet pour cacher le splash screen natif
  useEffect(() => {
    if (appIsReady) {
      // Cacher le splash screen natif d'Expo
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Effet pour rediriger en fonction de l'état d'authentification
  useEffect(() => {
    if (!appIsReady || isLoggedIn === null) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isLoggedIn && !inAuthGroup) {
      // Si pas connecté et pas dans la section auth, rediriger vers login
      router.replace("/(auth)/login");
    } else if (isLoggedIn && inAuthGroup) {
      // Si connecté et dans auth, rediriger vers les tabs
      router.replace("/(tabs)/dashboard");
    }
  }, [isLoggedIn, segments, router, appIsReady]);

  // Fonctions d'authentification
  const authContext: AuthContextType = {
    signIn: async (token: string) => {
      await AsyncStorage.setItem("userToken", token);
      setIsLoggedIn(true);
    },
    signOut: async () => {
      await AsyncStorage.removeItem("userToken");
      setIsLoggedIn(false);
      // Forcer la redirection vers l'écran de login
      router.replace("/(auth)/login");
    },
    isLoggedIn: !!isLoggedIn,
  };

  // Si l'app n'est pas prête, afficher un écran vide pour garder le splash screen natif visible
  if (!appIsReady) {
    return <View style={{ flex: 1, backgroundColor: "#231345" }} />;
  }

  // Affichage normal de l'app
  return (
    <AuthContext.Provider value={authContext}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "#231345" },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthContext.Provider>
  );
}
