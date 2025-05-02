import { Stack } from "expo-router";

// Thème
const THEME = {
  background: "#231345", // --background
  foreground: "#FBFBFB", // --foreground
  primary: "#8B3DFF", // --primary
};

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: THEME.background,
        },
        headerTintColor: THEME.foreground,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
        contentStyle: {
          backgroundColor: THEME.background,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Connexion",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Inscription",
        }}
      />
    </Stack>
  );
}
