import { Link } from "expo-router";
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { THEME } from "@/constants/Colors";
import { InputField } from "@/components/input-field";
import { AuthContext } from "../_layout";

// Composant pour les boutons de connexion sociale
const SocialButton: React.FC<{
  icon: any;
  label: string;
  onPress: () => void;
  backgroundColor: string;
}> = ({ icon, label, onPress, backgroundColor }) => {
  return (
    <TouchableOpacity
      style={[styles.socialButton, { backgroundColor }]}
      onPress={onPress}
    >
      <View style={styles.socialButtonContent}>
        <Image source={icon} style={styles.socialIcon} />
        <Text style={styles.socialButtonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface CredentialsError {
  email?: string;
  password?: string;
}

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<CredentialsError>({});
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { signIn } = authContext;

  // Fonction de validation simple
  const validate = () => {
    const newErrors = {} as CredentialsError;

    if (!email || !email.includes("@")) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }

    if (!password || password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction de connexion
  const handleLogin = async () => {
    if (validate()) {
      setIsLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await signIn({ email, password });
      } catch (error) {
        Alert.alert("Erreur", "Échec de la connexion");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Fonctions pour les connexions sociales
  const handleSocialLogin = (provider: string): void => {
    setIsLoading(true);

    // Simuler une requête d'API
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Connexion avec ${provider}`);
      // navigation.navigate('MainScreen');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            styles={styles}
          />

          <InputField
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            styles={styles}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={THEME.primaryForeground} />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <SocialButton
            icon={require("../../assets/images/google.png")} // Créez ces assets
            label="Google"
            backgroundColor="#FFFFFF"
            onPress={() => handleSocialLogin("Google")}
          />

          <SocialButton
            icon={require("../../assets/images/facebook.png")} // Créez ces assets
            label="Facebook"
            backgroundColor="#1877F2"
            onPress={() => handleSocialLogin("Facebook")}
          />
        </View> */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous n'avez pas de compte ?</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.signupText}>Inscrivez-vous</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: THEME.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.mutedForeground,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.foreground,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.input,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: THEME.foreground,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  inputError: {
    borderColor: THEME.destructive,
  },
  errorText: {
    color: THEME.destructive,
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: THEME.primary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: THEME.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: THEME.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.border,
  },
  dividerText: {
    color: THEME.mutedForeground,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 30,
  },
  socialButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontWeight: "500",
    fontSize: 14,
    color: "#252525", // Ajuster en fonction de la couleur de fond du bouton
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingVertical: 20,
  },
  footerText: {
    color: THEME.mutedForeground,
    fontSize: 14,
  },
  signupText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default LoginScreen;
