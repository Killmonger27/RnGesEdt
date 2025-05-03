// ProfileScreen.js
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/hooks/Redux";
import { signOut } from "@/redux/Authslice";

// Thème
const THEME = {
  background: "#231345", // --background
  foreground: "#FBFBFB", // --foreground
  primary: "#8B3DFF", // --primary
  secondary: "#2D204F", // --secondary
  muted: "#2D204F", // --muted
  mutedForeground: "#B4A9D6", // --muted-foreground
  border: "rgba(255, 255, 255, 0.1)", // --border
};

const ProfileScreen = () => {
  // Données de profil simulées
  const user = {
    name: "Jean Dupont",
    role: "Étudiant",
    email: "jean.dupont@example.com",
    phone: "+221 77 123 45 67",
    photoUrl: "https://randomuser.me/api/portraits/men/32.jpg", // Placez votre image ici
    studentNumber: "INE12345678",
    department: "Informatique",
    degree: "Licence",
  };
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    console.log("Déconnexion");
    dispatch(signOut()).unwrap();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.photoUrl }} style={styles.profileImage} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail-outline" size={20} color={THEME.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="call-outline" size={20} color={THEME.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informations académiques</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="card-outline" size={20} color={THEME.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Numéro INE</Text>
              <Text style={styles.infoValue}>{user.studentNumber}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="school-outline" size={20} color={THEME.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Filière</Text>
              <Text style={styles.infoValue}>{user.department}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="ribbon-outline" size={20} color={THEME.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Diplôme</Text>
              <Text style={styles.infoValue}>{user.degree}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="settings-outline"
            size={20}
            color={THEME.foreground}
          />
          <Text style={styles.actionButtonText}>Paramètres</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={THEME.foreground}
          />
          <Text style={styles.actionButtonText}>Changer le mot de passe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#E05C44" />
          <Text style={[styles.actionButtonText, styles.logoutText]}>
            Déconnexion
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: THEME.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: THEME.foreground,
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: THEME.mutedForeground,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.foreground,
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: THEME.secondary,
    borderRadius: 12,
    padding: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 61, 255, 0.1)", // Primary with opacity
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: THEME.mutedForeground,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: THEME.foreground,
  },
  separator: {
    height: 1,
    backgroundColor: THEME.border,
    marginHorizontal: 15,
  },
  actionsSection: {
    padding: 20,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.secondary,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  actionButtonText: {
    color: THEME.foreground,
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E05C44",
    backgroundColor: "rgba(224, 92, 68, 0.1)",
  },
  logoutText: {
    color: "#E05C44",
  },
});

export default ProfileScreen;
