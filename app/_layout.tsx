import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useRouter, useSegments } from "expo-router";
import { View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/Store";
import { useAppDispatch, useAppSelector } from "@/hooks/Redux";
import { checkAuth } from "@/redux/Authslice";

// Maintenir le splash screen visible pendant que nous vérifions l'authentification
SplashScreen.preventAutoHideAsync();

// Composant de redirection en fonction de l'état d'authentification
function AuthenticationGuard() {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const [appIsReady, setAppIsReady] = useState(false);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    async function prepare() {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [dispatch]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Effet pour rediriger en fonction de l'état d'authentification
  useEffect(() => {
    if (!appIsReady) return;

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

  // Si l'app n'est pas prête, afficher un écran vide pour garder le splash screen natif visible
  if (!appIsReady) {
    return <View style={{ flex: 1, backgroundColor: "#231345" }} />;
  }

  return null;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthenticationGuard />
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
      </PersistGate>
    </Provider>
  );
}
