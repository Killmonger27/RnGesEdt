// EdtScreen.tsx
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

const THEME = {
  background: "#231345",
  foreground: "#FBFBFB",
  primary: "#8B3DFF",
  secondary: "#2D204F",
  muted: "#2D204F",
  mutedForeground: "#B4A9D6",
  border: "rgba(255, 255, 255, 0.1)",
};

const EdtScreen = () => {
  const user = {
    id: "a26f85aa-0777-47cd-9d3c-f206a8e9c9d6",
    filiere: "176c879f-2c01-4e71-9019-8d178c8a50d4",
    filiereId: "MIAGE",
    role: "DELEGUE", // ou "ENSEIGNANT"
  };
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [cours, setCours] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [edts, setEdts] = useState<Edt[]>([]);
  const [selectedEdt, setSelectedEdt] = useState<Edt | null>(null);
  const [showEdtPicker, setShowEdtPicker] = useState(false);
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);

  useEffect(() => {
    const fetchPublishedEdts = async () => {
      try {
        setLoading(true);
        const publishedEdts = await getPublishedEdts(user.filiereId);
        setEdts(publishedEdts);

        if (publishedEdts.length > 0) {
          // Sélectionner l'EDT courant par défaut
          handleSelectEdt(publishedEdts[0]);
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les emplois du temps");
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedEdts();
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

  const handleSelectEdt = async (edt: Edt) => {
    try {
      setLoading(true);
      setSelectedEdt(edt);
      setShowEdtPicker(false);

      // Générer les jours de la semaine
      generateWeekDays(edt.dateDebut, edt.dateFin);

      // Récupérer les cours pour cet EDT
      const coursData = await getCoursByEdt(edt.id, user.filiereId);
      setCours(coursData);

      // Sélectionner le jour actuel par défaut
      setSelectedDay(getCurrentWeekday());
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les cours");
    } finally {
      setLoading(false);
    }
  };

  const generateWeekDays = (startDate: string, endDate: string) => {
    // Simplification pour l'exemple - dans une vraie app, utilisez les dates réelles
    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    setWeekDays(days);
  };

  const getCurrentWeekday = () => {
    const today = new Date().getDay();
    const weekdays = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    return weekdays[today];
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

  const getCoursForDay = (day: string) => {
    // Dans une vraie implémentation, vous filtreriez par date réelle
    // Pour l'exemple, nous simulons des données par jour
    return cours.filter((_, index) => {
      const dayIndex = weekDays.indexOf(day);
      return index % weekDays.length === dayIndex;
    });
  };

  const formatEdtTitle = (edt: Edt) => {
    return `Emploi du temps du ${new Date(
      edt.dateDebut
    ).toLocaleDateString()} au ${new Date(edt.dateFin).toLocaleDateString()}`;
  };

  if (loading && !selectedEdt) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sélecteur d'EDT */}
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

      {/* Sélecteur de jour */}
      {selectedEdt && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
        >
          {weekDays.map((day) => (
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
      )}

      {/* Liste des cours */}
      <ScrollView style={styles.coursesList}>
        {selectedEdt && (
          <>
            <Text style={styles.dateHeader}>
              {selectedDay} -{" "}
              {(filieres.find((f) => f.id === user.filiere) as Filiere)
                .nomFiliere +
                " " +
                (filieres.find((f) => f.id === user.filiere) as Filiere).niveau}
            </Text>

            {getCoursForDay(selectedDay).map((cours) => (
              <View key={cours.id} style={styles.courseCard}>
                <View style={styles.courseTime}>
                  <Text style={styles.courseTimeText}>{cours.crenau}</Text>
                </View>
                <View style={styles.courseDetails}>
                  <Text style={styles.courseName}>
                    Intitulé :{" "}
                    {
                      (modules.find((m) => m.id === cours.idMatiere) as Module)
                        .intitule
                    }
                  </Text>
                  <Text style={styles.courseRoom}>
                    Salle :{" "}
                    {
                      (salles.find((s) => s.id === cours.idSalle) as Salle)
                        .numeroSalle
                    }
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
            ))}
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
  edtSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: THEME.secondary,
    margin: 10,
    borderRadius: 8,
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
  },
  selectedDayButton: {
    backgroundColor: THEME.primary,
  },
  dayButtonText: {
    color: THEME.mutedForeground,
    fontWeight: "500",
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
});

export default EdtScreen;
