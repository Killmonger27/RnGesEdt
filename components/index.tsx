import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { THEME } from "@/constants/Colors";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

const AnimatedSplashScreen = () => {
  // Animations
  const logoOpacity = new Animated.Value(0);
  const logoScale = new Animated.Value(0.3);
  const textOpacity = new Animated.Value(0);
  const circleScale = new Animated.Value(0);
  const backgroundOpacity = new Animated.Value(0);

  useEffect(() => {
    // Démarrer l'animation du logo
    Animated.sequence([
      // Étape 0: Fade-in du fond
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      // Étape 1 : Afficher et agrandir le logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 10,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),

      // Étape 2 : Afficher le texte
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),

      // Étape 3 : Animer le cercle qui entoure le tout
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation terminée
      setTimeout(() => {
        // Ici, vous pouvez naviguer vers l'écran principal de votre application
        // Par exemple : navigation.navigate("Main");
        console.log("Animation terminée, naviguer vers l'écran principal");
        router.replace("/(auth)/login");
      }, 1500); // Réduit à 1.5 seconde pour une meilleure expérience utilisateur
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: backgroundOpacity }]}>
      {/* Cercle d'arrière-plan animé */}
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale: circleScale }],
          },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* Forme du logo - à remplacer par votre logo réel */}
        <View style={styles.logoShape} />
      </Animated.View>

      {/* Texte de l'application */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.appName}>EDT Manager</Text>
        <Text style={styles.tagline}>Simplicité et Efficacité</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.background,
  },
  circle: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "rgba(139, 61, 255, 0.08)", // Primary avec opacité réduite
    borderWidth: 2,
    borderColor: THEME.ring,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 30, // Bordure arrondie comme shadcn/ui (--radius: 0.75rem)
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    elevation: 8, // Ombre pour Android
    shadowColor: THEME.primary, // Ombre pour iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  logoShape: {
    width: 55,
    height: 55,
    borderRadius: 15, // Bordure légèrement arrondie
    backgroundColor: THEME.primaryForeground,
    // Vous pouvez remplacer ce composant par une vraie image de logo
  },
  textContainer: {
    alignItems: "center",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.foreground,
    textAlign: "center",
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: THEME.mutedForeground,
    textAlign: "center",
  },
});

export default AnimatedSplashScreen;
