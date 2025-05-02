// EdtScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

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

// Données simulées pour l'EDT
const weekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

const coursesData = {
  Lundi: [
    {
      id: 1,
      name: "Mathématiques",
      time: "08:00 - 10:00",
      room: "Salle 101",
      professor: "Dr. Dupont",
    },
    {
      id: 2,
      name: "Physique",
      time: "10:30 - 12:30",
      room: "Salle 102",
      professor: "Dr. Martin",
    },
    {
      id: 3,
      name: "Anglais",
      time: "14:00 - 16:00",
      room: "Salle 103",
      professor: "Mme. Johnson",
    },
  ],
  Mardi: [
    {
      id: 4,
      name: "Informatique",
      time: "09:00 - 11:00",
      room: "Labo 1",
      professor: "Dr. Lefèvre",
    },
    {
      id: 5,
      name: "Économie",
      time: "13:00 - 15:00",
      room: "Salle 205",
      professor: "Dr. Dubois",
    },
  ],
  Mercredi: [
    {
      id: 6,
      name: "Gestion",
      time: "08:00 - 10:00",
      room: "Amphi A",
      professor: "Dr. Moreau",
    },
    {
      id: 7,
      name: "Marketing",
      time: "10:30 - 12:30",
      room: "Salle 301",
      professor: "Mme. Bernard",
    },
  ],
  Jeudi: [
    {
      id: 8,
      name: "Statistiques",
      time: "10:00 - 12:00",
      room: "Salle 202",
      professor: "Dr. Thomas",
    },
    {
      id: 9,
      name: "Droit",
      time: "14:00 - 16:00",
      room: "Salle 303",
      professor: "Me. Petit",
    },
    {
      id: 10,
      name: "Communication",
      time: "16:30 - 18:30",
      room: "Salle 105",
      professor: "Dr. Robert",
    },
  ],
  Vendredi: [
    {
      id: 11,
      name: "Projet",
      time: "09:00 - 12:00",
      room: "Labo 2",
      professor: "Dr. Simon",
    },
    {
      id: 12,
      name: "Chimie",
      time: "14:00 - 16:00",
      room: "Labo 3",
      professor: "Dr. Blanc",
    },
  ],
};

const EdtScreen = () => {
  const [selectedDay, setSelectedDay] = useState("Lundi");

  return (
    <View style={styles.container}>
      {/* En-tête avec sélection de jour */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
        contentContainerStyle={styles.daySelectorContent}
      >
        {weekdays.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.selectedDayButton,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay === day && styles.selectedDayButtonText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste des cours pour le jour sélectionné */}
      <ScrollView style={styles.coursesList}>
        <Text style={styles.dateHeader}>
          {selectedDay} {new Date().getDate()}{" "}
          {new Date().toLocaleDateString("fr-FR", { month: "long" })}
        </Text>

        {coursesData[selectedDay].map((course) => (
          <View key={course.id} style={styles.courseCard}>
            <View style={styles.courseTime}>
              <Text style={styles.courseTimeText}>{course.time}</Text>
            </View>
            <View style={styles.courseDetails}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseRoom}>{course.room}</Text>
              <Text style={styles.courseProfessor}>{course.professor}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  daySelector: {
    backgroundColor: THEME.secondary,
  },
  daySelectorContent: {
    paddingHorizontal: 10,
  },
  dayButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  selectedDayButton: {
    borderBottomColor: THEME.primary,
  },
  dayButtonText: {
    color: THEME.mutedForeground,
    fontWeight: "500",
    fontSize: 16,
  },
  selectedDayButtonText: {
    color: THEME.foreground,
    fontWeight: "bold",
  },
  coursesList: {
    flex: 1,
    padding: 20,
  },
  dateHeader: {
    fontSize: 18,
    color: THEME.foreground,
    marginBottom: 20,
    fontWeight: "500",
  },
  courseCard: {
    backgroundColor: THEME.secondary,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    overflow: "hidden",
  },
  courseTime: {
    width: 90,
    backgroundColor: THEME.primary,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  courseTimeText: {
    color: THEME.foreground,
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  courseDetails: {
    flex: 1,
    padding: 15,
  },
  courseName: {
    color: THEME.foreground,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  courseRoom: {
    color: THEME.primary,
    fontSize: 14,
    marginBottom: 3,
  },
  courseProfessor: {
    color: THEME.mutedForeground,
    fontSize: 14,
  },
});

export default EdtScreen;
