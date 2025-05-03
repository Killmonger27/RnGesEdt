import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { signOut } from "@/redux/Authslice";
import { useAppDispatch } from "@/hooks/Redux";

// Thème
const THEME = {
  background: "#231345", // --background
  foreground: "#FBFBFB", // --foreground
  primary: "#8B3DFF", // --primary
  primaryForeground: "#F7F2FF", // --primary-foreground
  secondary: "#2D204F", // --secondary
  secondaryForeground: "#FBFBFB", // --secondary-foreground
  muted: "#2D204F", // --muted
  mutedForeground: "#B4A9D6", // --muted-foreground
};

export default function TabsLayout() {
  const dispatch = useAppDispatch();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName:
            | "home"
            | "home-outline"
            | "calendar"
            | "calendar-outline"
            | "person"
            | "person-outline" = "home-outline";

          if (route.name === "dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "edt") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.mutedForeground,
        tabBarStyle: {
          backgroundColor: THEME.background,
          borderTopColor: THEME.secondary,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: THEME.background,
          borderBottomColor: THEME.secondary,
          borderBottomWidth: 1,
          elevation: 0, // Supprime l'ombre sur Android
          shadowOpacity: 0, // Supprime l'ombre sur iOS
        },
        headerTitleStyle: {
          color: THEME.foreground,
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
        // Ajout d'un bouton de déconnexion dans l'en-tête
        headerRight: () => (
          <TouchableOpacity
            onPress={() => dispatch(signOut())}
            style={{ marginRight: 16 }}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={THEME.foreground}
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Acceuil",
        }}
      />
      <Tabs.Screen
        name="edt"
        options={{
          title: "Emploi du temps",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Mon profil",
        }}
      />
    </Tabs>
  );
}
