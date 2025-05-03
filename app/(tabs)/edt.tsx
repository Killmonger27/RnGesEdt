import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import {
  getCoursByEdt,
  updateCoursStatus,
  updateProfDisponibility,
} from "@/services/CoursService";
import { getPublishedEdts } from "@/services/EdtService";
import { Cours, EStatutCours, EDisponibiliteProf, Edt } from "@/interfaces/EDT";
import { getFilieres } from "@/services/FiliereService";
import { getModules } from "@/services/ModuleService";
import { getSalles } from "@/services/SalleSercice";
import { Module, Filiere, Salle } from "@/interfaces/Shared";
import * as Notification from "expo-notifications";

const THEME = {
  background: "#231345",
  foreground: "#FBFBFB",
  primary: "#8B3DFF",
  secondary: "#2D204F",
  muted: "#2D204F",
  mutedForeground: "#B4A9D6",
  border: "rgba(255, 255, 255, 0.1)",
};

// Interface pour les jours avec dates réelles
interface DayInfo {
  date: Date;
  dayName: string;
  formattedDate: string;
}

const EdtScreen = () => {
  const user = {
    id: "a26f85aa-0777-47cd-9d3c-f206a8e9c9d6",
    filiere: "176c879f-2c01-4e71-9019-8d178c8a50d4",
    filiereId: "MIAGE",
    role: "DELEGUE", // ou "ENSEIGNANT"
  };
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [cours, setCours] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [edts, setEdts] = useState<Edt[]>([]);
  const [selectedEdt, setSelectedEdt] = useState<Edt | null>(null);
  const [showEdtPicker, setShowEdtPicker] = useState(false);
  const [weekDays, setWeekDays] = useState<DayInfo[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);

  // Fonction pour trouver l'EDT qui couvre la date courante
  const findCurrentEdt = (edts: Edt[], currentDate: Date): Edt | null => {
    // Convertir la date courante au format ISO sans l'heure pour la comparaison
    currentDate.setHours(0, 0, 0, 0);

    // Chercher un EDT dont la période couvre la date courante
    return (
      edts.find((edt) => {
        const startDate = new Date(edt.dateDebut);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(edt.dateFin);
        endDate.setHours(23, 59, 59, 999); // Fin de journée

        return currentDate >= startDate && currentDate <= endDate;
      }) || null
    );
  };

  // Fonction pour actualiser les données
  const refreshData = async () => {
    try {
      setLoading(true);
      const publishedEdts = await getPublishedEdts(user.filiereId);
      setEdts(publishedEdts);

      if (publishedEdts.length > 0) {
        // Trouver l'EDT qui couvre la date courante
        const currentDate = new Date();
        const currentEdt = findCurrentEdt(publishedEdts, currentDate);

        // Si un EDT couvrant la date actuelle est trouvé, le sélectionner
        // Sinon, prendre le premier EDT publié
        handleSelectEdt(currentEdt || publishedEdts[0]);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les emplois du temps");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEdt = async (edt: Edt) => {
    try {
      setLoading(true);
      setSelectedEdt(edt);
      setShowEdtPicker(false);

      // Générer les jours de la semaine avec les dates réelles
      const days = generateWeekDays(edt.dateDebut, edt.dateFin);
      setWeekDays(days);

      // Récupérer les cours pour cet EDT
      const coursData = await getCoursByEdt(edt.id, user.filiereId);
      setCours(coursData);

      // Sélectionner le jour actuel par défaut ou le premier jour de l'EDT
      const currentDay = findCurrentDay(days);
      setSelectedDay(currentDay || days[0]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les cours");
    } finally {
      setLoading(false);
    }
  };

  // Génère les jours de la semaine à partir des dates réelles de l'EDT
  const generateWeekDays = (startDate: string, endDate: string): DayInfo[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: DayInfo[] = [];

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

    // Options de formatage de date pour l'affichage
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
    };

    // Créer un tableau de jours entre la date de début et la date de fin
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayName = dayNames[currentDate.getDay()];
      const formattedDate = currentDate.toLocaleDateString(
        "fr-FR",
        dateOptions
      );

      // Inclure samedi, ignorer seulement dimanche (dimanche=0, samedi=6)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0) {
        // Inclure tous les jours sauf dimanche
        days.push({
          date: new Date(currentDate),
          dayName,
          formattedDate,
        });
      }

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Trouver le jour courant dans la liste des jours de la semaine
  const findCurrentDay = (days: DayInfo[]): DayInfo | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      days.find((day) => {
        const date = new Date(day.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
      }) || null
    );
  };

  const handleMarkAsDone = async (coursId: string) => {
    try {
      await updateCoursStatus(coursId);
      setCours(
        cours.map((c) => (c.id === coursId ? { ...c, statutCours: "FAIT" } : c))
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut du cours");
    }
  };

  const handleToggleDisponibility = async (coursId: string) => {
    try {
      const coursToUpdate = cours.find((c) => c.id === coursId);
      if (!coursToUpdate) return;

      const newStatus =
        coursToUpdate.disponibiliteProf === EDisponibiliteProf.DISPONIBLE
          ? EDisponibiliteProf.INDISPONIBLE
          : EDisponibiliteProf.DISPONIBLE;

      await updateProfDisponibility(coursId);
      setCours(
        cours.map((c) =>
          c.id === coursId ? { ...c, disponibiliteProf: newStatus } : c
        )
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour la disponibilité");
    }
  };

  // Filtrer les cours pour le jour sélectionné en utilisant les dates réelles
  const getCoursForDay = (selectedDay: DayInfo | null) => {
    if (!selectedDay) return [];

    // Convertir la date sélectionnée en format ISO sans l'heure pour la comparaison
    const selectedDate = new Date(selectedDay.date);
    selectedDate.setHours(0, 0, 0, 0);
    const dateString = selectedDate.toISOString().split("T")[0];

    // Filtrer les cours par date
    return cours.filter((cours) => {
      // Supposons que chaque cours a une propriété date (à ajuster selon votre modèle de données)
      // Si ce n'est pas le cas, vous devrez adapter cette logique
      const coursDate = new Date(cours.date || "");
      coursDate.setHours(0, 0, 0, 0);
      const coursDateString = coursDate.toISOString().split("T")[0];

      return coursDateString === dateString;
    });
  };

  const formatEdtTitle = (edt: Edt) => {
    return `Emploi du temps du ${new Date(edt.dateDebut).toLocaleDateString(
      "fr-FR"
    )} au ${new Date(edt.dateFin).toLocaleDateString("fr-FR")}`;
  };

  // Effet pour charger les données au démarrage
  useEffect(() => {
    refreshData();
    const fetchFilieres = async () => {
      try {
        const filieresData = await getFilieres();
        setFilieres(filieresData);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les filières");
      }
    };
    const fetchModules = async () => {
      try {
        const modulesData = await getModules();
        setModules(modulesData);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les modules");
      }
    };
    const fetchSalles = async () => {
      try {
        const sallesData = await getSalles();
        setSalles(sallesData);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les salles");
      }
    };
    fetchFilieres();
    fetchModules();
    fetchSalles();
  }, []);

  // Hook pour vérifier s'il y a un nouvel EDT toutes les minutes
  useEffect(() => {
    // Fonction pour vérifier les nouveaux EDT
    const checkForNewEdts = async () => {
      try {
        const freshEdts = await getPublishedEdts(user.filiereId);

        // Si le nombre d'EDT a changé, actualiser l'écran
        if (freshEdts.length !== edts.length) {
          refreshData();
          return;
        }

        // Vérifier si un nouvel EDT a été publié qui couvre la date actuelle
        const currentDate = new Date();
        const currentEdt = findCurrentEdt(freshEdts, currentDate);

        // Si l'EDT courant a changé, actualiser
        if (currentEdt && (!selectedEdt || currentEdt.id !== selectedEdt.id)) {
          refreshData();
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des nouveaux EDT", error);
      }
    };

    // Vérifier toutes les minutes
    const interval = setInterval(checkForNewEdts, 60000);

    // Nettoyer l'intervalle quand le composant est démonté
    return () => clearInterval(interval);
  }, [edts, selectedEdt]);

  if (loading && !selectedEdt) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec sélecteur d'EDT et bouton de rafraîchissement */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.edtSelector}
          onPress={() => setShowEdtPicker(true)}
        >
          <Text style={styles.edtSelectorText}>
            {selectedEdt
              ? formatEdtTitle(selectedEdt)
              : "Choisir un emploi du temps"}
          </Text>
          <Text style={styles.edtSelectorArrow}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
          <Text style={styles.refreshButtonText}>⟳</Text>
        </TouchableOpacity>
      </View>

      {/* Sélecteur de jour */}
      {selectedEdt && weekDays.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
        >
          {weekDays.map((day) => (
            <TouchableOpacity
              key={day.formattedDate}
              style={[
                styles.dayButton,
                selectedDay?.formattedDate === day.formattedDate &&
                  styles.selectedDayButton,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDay?.formattedDate === day.formattedDate &&
                    styles.selectedDayButtonText,
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  styles.dayDateText,
                  selectedDay?.formattedDate === day.formattedDate &&
                    styles.selectedDayButtonText,
                ]}
              >
                {day.formattedDate}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Liste des cours */}
      <ScrollView style={styles.coursesList}>
        {selectedEdt && selectedDay && (
          <>
            <Text style={styles.dateHeader}>
              {selectedDay.dayName} {selectedDay.formattedDate} -{" "}
              {filieres.length > 0 &&
                user.filiere &&
                ((filieres.find((f) => f.id === user.filiere) as Filiere) || {})
                  ?.nomFiliere +
                  " " +
                  (
                    (filieres.find((f) => f.id === user.filiere) as Filiere) ||
                    {}
                  )?.niveau}
            </Text>

            {getCoursForDay(selectedDay).length > 0 ? (
              getCoursForDay(selectedDay).map((cours) => (
                <View key={cours.id} style={styles.courseCard}>
                  <View style={styles.courseTime}>
                    <Text style={styles.courseTimeText}>{cours.crenau}</Text>
                  </View>
                  <View style={styles.courseDetails}>
                    <Text style={styles.courseName}>
                      Intitulé :{" "}
                      {modules.length > 0 &&
                        (
                          (modules.find(
                            (m) => m.id === cours.idMatiere
                          ) as Module) || {}
                        )?.intitule}
                    </Text>
                    <Text style={styles.courseRoom}>
                      Salle :{" "}
                      {salles.length > 0 &&
                        (
                          (salles.find(
                            (s) => s.id === cours.idSalle
                          ) as Salle) || {}
                        )?.numeroSalle}
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
              ))
            ) : (
              <Text style={styles.noCoursText}>
                Aucun cours prévu pour cette journée
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de sélection d'EDT */}
      <Modal
        visible={showEdtPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEdtPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir un emploi du temps</Text>
            <ScrollView>
              {edts.map((edt) => (
                <Pressable
                  key={edt.id}
                  style={styles.edtItem}
                  onPress={() => handleSelectEdt(edt)}
                >
                  <Text style={styles.edtItemText}>{formatEdtTitle(edt)}</Text>
                  {selectedEdt?.id === edt.id && (
                    <Text style={styles.edtItemSelected}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowEdtPicker(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },
  edtSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: THEME.secondary,
    borderRadius: 8,
    flex: 1,
  },
  refreshButton: {
    backgroundColor: THEME.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  refreshButtonText: {
    color: THEME.foreground,
    fontSize: 24,
    fontWeight: "bold",
  },
  edtSelectorText: {
    color: THEME.foreground,
    fontWeight: "bold",
  },
  edtSelectorArrow: {
    color: THEME.mutedForeground,
  },
  daySelector: {
    backgroundColor: THEME.secondary,
    paddingVertical: 10,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: "center",
  },
  selectedDayButton: {
    backgroundColor: THEME.primary,
  },
  dayButtonText: {
    color: THEME.mutedForeground,
    fontWeight: "500",
  },
  dayDateText: {
    color: THEME.mutedForeground,
    fontSize: 12,
    marginTop: 3,
  },
  selectedDayButtonText: {
    color: THEME.foreground,
    fontWeight: "bold",
  },
  coursesList: {
    flex: 1,
    padding: 15,
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
    fontSize: 14,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: THEME.background,
    margin: 20,
    borderRadius: 10,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.foreground,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  edtItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  edtItemText: {
    color: THEME.foreground,
  },
  edtItemSelected: {
    color: THEME.primary,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 15,
    backgroundColor: THEME.primary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: THEME.foreground,
    fontWeight: "bold",
  },
  noCoursText: {
    color: THEME.mutedForeground,
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
  },
});

export default EdtScreen;
