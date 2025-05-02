// DashboardScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  getCoursByEdt,
  updateCoursStatus,
  updateProfDisponibility,
} from "@/services/CoursService";
import { getPublishedEdts } from "@/services/EdtService";
import { getFilieres } from "@/services/FiliereService";
import { getModules } from "@/services/ModuleService";
import { getSalles } from "@/services/SalleSercice";
import { Cours, EStatutCours, EDisponibiliteProf, Edt } from "@/interfaces/EDT";
import { Module, Filiere, Salle } from "@/interfaces/Shared";

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
  const user = {
    id: "a26f85aa-0777-47cd-9d3c-f206a8e9c9d6",
    filiere: "176c879f-2c01-4e71-9019-8d178c8a50d4",
    filiereId: "MIAGE",
    role: "ENSEIGNANT", // ou "ENSEIGNANT"
  };

  const [loading, setLoading] = useState(true);
  const [currentEdt, setCurrentEdt] = useState<Edt | null>(null);
  const [todayCourses, setTodayCourses] = useState<Cours[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<Cours[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState(0);

  // Format français des jours
  const dayNames = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  // Fonction pour trouver l'EDT actuel
  const findCurrentEdt = (edts: Edt[]) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return (
      edts.find((edt) => {
        const startDate = new Date(edt.dateDebut);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(edt.dateFin);
        endDate.setHours(23, 59, 59, 999);

        return currentDate >= startDate && currentDate <= endDate;
      }) || edts[0]
    ); // Prendre le premier EDT si aucun ne correspond à la date actuelle
  };

  // Fonction pour obtenir la date d'aujourd'hui
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Fonction pour filtrer les cours d'aujourd'hui
  const filterTodayCourses = (courses: Cours[]) => {
    const today = getTodayDateString();
    return courses.filter((course) => {
      const courseDate = new Date(course.date || "");
      const courseDateString = courseDate.toISOString().split("T")[0];
      return courseDateString === today;
    });
  };

  // Fonction pour filtrer les cours à venir (prochains cours de la journée)
  const filterUpcomingCourses = (courses: Cours[]) => {
    const today = getTodayDateString();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Filtrer les cours d'aujourd'hui qui n'ont pas encore eu lieu
    const todayCourses = courses.filter((course) => {
      const courseDate = new Date(course.date || "");
      const courseDateString = courseDate.toISOString().split("T")[0];

      if (courseDateString === today) {
        // Extraire l'heure du créneau (format supposé: "10:30 - 12:00")
        const timeParts = course.crenau.split(" - ")[0].split(":");
        if (timeParts.length === 2) {
          const courseHour = parseInt(timeParts[0]);
          const courseMinutes = parseInt(timeParts[1]);

          // Le cours n'a pas encore eu lieu
          return (
            courseHour > currentHour ||
            (courseHour === currentHour && courseMinutes > currentMinutes)
          );
        }
      }
      return false;
    });

    // Trier par heure de début
    return todayCourses.sort((a, b) => {
      const aTimeParts = a.crenau.split(" - ")[0].split(":");
      const bTimeParts = b.crenau.split(" - ")[0].split(":");

      const aHour = parseInt(aTimeParts[0]);
      const aMinutes = parseInt(aTimeParts[1]);
      const bHour = parseInt(bTimeParts[0]);
      const bMinutes = parseInt(bTimeParts[1]);

      if (aHour !== bHour) return aHour - bHour;
      return aMinutes - bMinutes;
    });
  };

  // Fonction pour extraire l'heure et la durée d'un créneau
  const extractTimeInfo = (crenau: "MATIN" | "SOIR") => {
    if (crenau === "MATIN") {
      return { time: "08h:00", duration: "4h" };
    } else if (crenau === "SOIR") {
      return { time: "14h:00", duration: "4h" };
    }
  };

  // Fonction pour marquer un cours comme fait
  const handleMarkAsDone = async (coursId: string) => {
    try {
      await updateCoursStatus(coursId);

      // Mettre à jour les listes de cours
      setTodayCourses(
        todayCourses.map((c) =>
          c.id === coursId ? { ...c, statutCours: "FAIT" } : c
        )
      );

      setUpcomingCourses(
        upcomingCourses.map((c) =>
          c.id === coursId ? { ...c, statutCours: "FAIT" } : c
        )
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut du cours");
    }
  };

  // Fonction pour basculer la disponibilité de l'enseignant
  const handleToggleDisponibility = async (coursId: string) => {
    try {
      const courseToUpdate = [...todayCourses, ...upcomingCourses].find(
        (c) => c.id === coursId
      );
      if (!courseToUpdate) return;

      const newStatus =
        courseToUpdate.disponibiliteProf === EDisponibiliteProf.DISPONIBLE
          ? EDisponibiliteProf.INDISPONIBLE
          : EDisponibiliteProf.DISPONIBLE;

      await updateProfDisponibility(coursId);

      // Mettre à jour les listes de cours
      setTodayCourses(
        todayCourses.map((c) =>
          c.id === coursId ? { ...c, disponibiliteProf: newStatus } : c
        )
      );

      setUpcomingCourses(
        upcomingCourses.map((c) =>
          c.id === coursId ? { ...c, disponibiliteProf: newStatus } : c
        )
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour la disponibilité");
    }
  };

  // Fonction pour charger les données initiales
  const loadData = async () => {
    try {
      setLoading(true);

      // Charger toutes les données nécessaires en parallèle
      const [edtsData, filieresData, modulesData, sallesData] =
        await Promise.all([
          getPublishedEdts(user.filiereId),
          getFilieres(),
          getModules(),
          getSalles(),
        ]);

      setFilieres(filieresData);
      setModules(modulesData);
      setSalles(sallesData);

      if (edtsData.length > 0) {
        const edt = findCurrentEdt(edtsData);
        setCurrentEdt(edt);

        // Charger les cours pour cet EDT
        const coursData = await getCoursByEdt(edt.id, user.filiereId);

        // Filtrer les cours pour aujourd'hui et les prochains cours
        const todayCoursesData = filterTodayCourses(coursData);
        const upcomingCoursesData = filterUpcomingCourses(coursData);

        setTodayCourses(todayCoursesData);
        setUpcomingCourses(upcomingCoursesData);

        // Simuler le nombre de devoirs à rendre (à remplacer par une vraie fonction)
        setPendingAssignments(Math.floor(Math.random() * 5));
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les données au démarrage
  useEffect(() => {
    loadData();
  }, []);

  // Format de la date du jour
  const formattedDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Obtenir le nom de la filière actuelle
  const getCurrentFiliereName = () => {
    if (filieres.length > 0 && user.filiere) {
      const filiere = filieres.find((f) => f.id === user.filiere);
      if (filiere) {
        return `${filiere.nomFiliere} ${filiere.niveau}`;
      }
    }
    return "";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bonjour, {user.role === "DELEGUE" ? "Délégué" : "Enseignant"}
        </Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.filiereText}>{getCurrentFiliereName()}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayCourses.length}</Text>
          <Text style={styles.statLabel}>Cours aujourd'hui</Text>
        </View>
        {user.role === "DELEGUE" ? (
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingAssignments}</Text>
            <Text style={styles.statLabel}>Devoirs à rendre</Text>
          </View>
        ) : (
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {
                todayCourses.filter((c) => c.statutCours === EStatutCours.FAIT)
                  .length
              }
            </Text>
            <Text style={styles.statLabel}>Cours effectués</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
        <Text style={styles.refreshButtonText}>Actualiser</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Prochains cours</Text>
      {upcomingCourses.length > 0 ? (
        <View style={styles.courseContainer}>
          {upcomingCourses.slice(0, 3).map((cours) => {
            const timeInfo = extractTimeInfo(cours.crenau);
            const time = timeInfo?.time || "N/A";
            const duration = timeInfo?.duration || "N/A";
            const moduleInfo = modules.find((m) => m.id === cours.idMatiere);
            const salleInfo = salles.find((s) => s.id === cours.idSalle);

            return (
              <View key={cours.id} style={styles.courseCard}>
                <View style={styles.courseTime}>
                  <Text style={styles.timeText}>{time}</Text>
                  <Text style={styles.durationText}>{duration}</Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>
                    {moduleInfo ? moduleInfo.intitule : "Module inconnu"}
                  </Text>
                  <Text style={styles.courseLocation}>
                    Salle {salleInfo ? salleInfo.numeroSalle : "N/A"}
                  </Text>

                  {user.role === "DELEGUE" && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        cours.statutCours === EStatutCours.FAIT &&
                          styles.doneButton,
                      ]}
                      onPress={() => handleMarkAsDone(cours.id)}
                    >
                      <Text style={styles.actionButtonText}>
                        {cours.statutCours === EStatutCours.FAIT
                          ? "Fait ✓"
                          : "Marquer comme fait"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {user.role === "ENSEIGNANT" && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        cours.disponibiliteProf ===
                          EDisponibiliteProf.INDISPONIBLE &&
                          styles.unavailableButton,
                      ]}
                      onPress={() => handleToggleDisponibility(cours.id)}
                    >
                      <Text style={styles.actionButtonText}>
                        {cours.disponibiliteProf ===
                        EDisponibiliteProf.INDISPONIBLE
                          ? "Indisponible ✗"
                          : "Disponible ✓"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {upcomingCourses.length > 3 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                Voir tous les cours ({upcomingCourses.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Aucun cours à venir aujourd'hui
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Résumé des cours</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total aujourd'hui:</Text>
          <Text style={styles.summaryValue}>{todayCourses.length} cours</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Cours effectués:</Text>
          <Text style={styles.summaryValue}>
            {
              todayCourses.filter((c) => c.statutCours === EStatutCours.FAIT)
                .length
            }{" "}
            / {todayCourses.length}
          </Text>
        </View>

        {currentEdt && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Période actuelle:</Text>
            <Text style={styles.summaryValue}>
              {new Date(currentEdt.dateDebut).toLocaleDateString("fr-FR")} -{" "}
              {new Date(currentEdt.dateFin).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
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
  filiereText: {
    color: THEME.primary,
    fontSize: 16,
    marginTop: 4,
    fontWeight: "500",
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
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: THEME.primary,
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: THEME.foreground,
    fontWeight: "bold",
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
    marginBottom: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: THEME.muted,
    alignSelf: "flex-start",
  },
  doneButton: {
    backgroundColor: "#4CAF50",
  },
  unavailableButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: THEME.foreground,
    fontSize: 12,
    fontWeight: "bold",
  },
  viewAllButton: {
    padding: 12,
    alignItems: "center",
    backgroundColor: THEME.secondary,
    borderRadius: 8,
    marginTop: 5,
  },
  viewAllText: {
    color: THEME.primary,
    fontWeight: "bold",
  },
  emptyState: {
    padding: 30,
    alignItems: "center",
    backgroundColor: THEME.secondary,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  emptyStateText: {
    color: THEME.mutedForeground,
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: THEME.secondary,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  summaryLabel: {
    color: THEME.mutedForeground,
    fontSize: 14,
  },
  summaryValue: {
    color: THEME.foreground,
    fontWeight: "500",
    fontSize: 14,
  },
});

export default DashboardScreen;
