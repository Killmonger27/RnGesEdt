// DashboardScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

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

const DashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bonjour, User</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Cours aujourd'hui</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Devoirs à rendre</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Prochains cours</Text>
      <View style={styles.courseContainer}>
        <View style={styles.courseCard}>
          <View style={styles.courseTime}>
            <Text style={styles.timeText}>08:00</Text>
            <Text style={styles.durationText}>2h</Text>
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>Mathématiques</Text>
            <Text style={styles.courseLocation}>Salle 201</Text>
          </View>
        </View>

        <View style={styles.courseCard}>
          <View style={styles.courseTime}>
            <Text style={styles.timeText}>10:30</Text>
            <Text style={styles.durationText}>1h30</Text>
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>Informatique</Text>
            <Text style={styles.courseLocation}>Labo Info 2</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Annonces</Text>
      <View style={styles.announcementCard}>
        <Text style={styles.announcementTitle}>Fermeture Bibliothèque</Text>
        <Text style={styles.announcementDate}>Il y a 2 heures</Text>
        <Text style={styles.announcementText}>
          La bibliothèque sera fermée ce vendredi pour maintenance. Veuillez
          prévoir de rendre vos livres avant jeudi.
        </Text>
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
    padding: 20,
    paddingTop: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.foreground,
  },
  dateText: {
    color: THEME.mutedForeground,
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 0,
  },
  statCard: {
    backgroundColor: THEME.secondary,
    padding: 20,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.primary,
  },
  statLabel: {
    color: THEME.mutedForeground,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.foreground,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  courseContainer: {
    paddingHorizontal: 20,
  },
  courseCard: {
    backgroundColor: THEME.secondary,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  courseTime: {
    backgroundColor: THEME.primary,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  timeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  durationText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  courseInfo: {
    padding: 15,
    flex: 1,
  },
  courseTitle: {
    color: THEME.foreground,
    fontWeight: "bold",
    fontSize: 16,
  },
  courseLocation: {
    color: THEME.mutedForeground,
    marginTop: 4,
  },
  announcementCard: {
    backgroundColor: THEME.secondary,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  announcementTitle: {
    color: THEME.foreground,
    fontWeight: "bold",
    fontSize: 16,
  },
  announcementDate: {
    color: THEME.mutedForeground,
    fontSize: 12,
    marginBottom: 10,
  },
  announcementText: {
    color: THEME.foreground,
    lineHeight: 20,
  },
});

export default DashboardScreen;
