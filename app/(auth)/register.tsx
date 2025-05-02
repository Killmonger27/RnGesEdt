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
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { InputField } from "@/components/input-field";
import { THEME } from "@/constants/Colors";
import {
  ROLES,
  SEXE,
  TYPE_PARENT,
  TITRE_ETUDIANT,
  TYPE_ENSEIGNANT,
} from "@/constants/Roles";
import { router } from "expo-router";
import { AuthContext } from "../_layout";
import { RegisterRequest } from "@/interfaces/Authentification";

// Composant pour les sélecteurs
type SelectFieldProps = {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: Record<string, string>;
  error?: string;
};

interface FormError {
  nom?: string;

  prenom?: string;

  sexe?: string;

  telephone?: string;

  email?: string;

  password?: string;

  role?: string;

  typeParent?: string;

  lieuResidence?: string;

  ine?: string;

  titreEtudiant?: string;

  parentId?: string;

  filiereId?: string;

  matricule?: string;

  typeEnseignant?: string;

  grade?: string;

  specialite?: string;

  typeAdmin?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Récupérer le label correspondant à la valeur sélectionnée
  const getSelectedLabel = () => {
    if (!selectedValue) return "Sélectionner...";
    const entry = Object.entries(items).find(
      ([_, value]) => value === selectedValue
    );
    return entry ? entry[1] : "Sélectionner...";
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
        <View style={[styles.dropdownButton, error && styles.inputError]}>
          <Text
            style={[
              styles.dropdownButtonText,
              !selectedValue && styles.dropdownPlaceholder,
            ]}
          >
            {getSelectedLabel()}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.optionsList}>
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    !selectedValue && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onValueChange("");
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>Sélectionner...</Text>
                </TouchableOpacity>

                {Object.entries(items).map(([key, value]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.optionItem,
                      selectedValue === value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      onValueChange(value);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const RegisterScreen = () => {
  // État initial basé sur le DTO
  const [formData, setFormData] = useState<RegisterRequest>(
    {} as RegisterRequest
  );

  const [errors, setErrors] = useState<FormError>({} as FormError);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Pour navigation par étapes
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { signIn } = authContext;

  // Mettre à jour le formulaire
  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Fonction de validation du formulaire
  const validate = () => {
    const newErrors = {} as FormError;

    // Validation des champs communs
    if (!formData.nom) newErrors.nom = "Le nom est obligatoire";
    if (!formData.prenom) newErrors.prenom = "Le prénom est obligatoire";
    if (!formData.sexe) newErrors.sexe = "Le sexe est obligatoire";

    // Validation téléphone avec expression régulière
    const phoneRegex = /^(\+\d{1,3})?\s?(\d{8})$/;
    if (!formData.telephone) {
      newErrors.telephone = "Le numéro de téléphone est obligatoire";
    } else if (!phoneRegex.test(formData.telephone)) {
      newErrors.telephone = "Format de téléphone invalide";
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "L'email est obligatoire";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est obligatoire";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Validation du rôle
    if (!formData.role) newErrors.role = "Le rôle est obligatoire";

    // Validations spécifiques selon le rôle
    if (formData.role === ROLES.PARENT) {
      if (!formData.typeParent)
        newErrors.typeParent = "Le type de parent est obligatoire";
      if (!formData.lieuResidence)
        newErrors.lieuResidence = "Le lieu de résidence est obligatoire";
    } else if (formData.role === ROLES.ETUDIANT) {
      if (!formData.ine) newErrors.ine = "Le numéro INE est obligatoire";
      if (!formData.titreEtudiant)
        newErrors.titreEtudiant = "Le titre de l'étudiant est obligatoire";
      if (!formData.filiereId)
        newErrors.filiereId = "La filière est obligatoire";
    } else if (formData.role === ROLES.ENSEIGNANT) {
      if (!formData.matricule)
        newErrors.matricule = "Le matricule est obligatoire";
      if (!formData.typeEnseignant)
        newErrors.typeEnseignant = "Le type d'enseignant est obligatoire";
      if (!formData.grade) newErrors.grade = "Le grade est obligatoire";
      if (!formData.specialite)
        newErrors.specialite = "La spécialité est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    if (validate()) {
      setIsLoading(true);

      // Simuler une requête API
      try {
        // Simuler un appel API
        // Remplacez par votre véritable appel d'API d'inscription
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Inscription réussie avec:", formData);
        // Simuler un token reçu après l'inscription
        const userToken = "fake-auth-token";

        // Connecter l'utilisateur après l'inscription
        await signIn(userToken);
      } catch (error) {
        Alert.alert("Erreur", "Échec de l'inscription");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Naviguer entre les étapes
  const handleNext = () => {
    // Validation de l'étape actuelle
    const currentStepValid = validateCurrentStep();

    if (currentStepValid) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Valider uniquement les champs de l'étape actuelle
  const validateCurrentStep = () => {
    const newErrors = {} as FormError;

    if (step === 1) {
      if (!formData.nom) newErrors.nom = "Le nom est obligatoire";
      if (!formData.prenom) newErrors.prenom = "Le prénom est obligatoire";
      if (!formData.sexe) newErrors.sexe = "Le sexe est obligatoire";

      const phoneRegex = /^(\+\d{1,3})?\s?(\d{8})$/;
      if (!formData.telephone) {
        newErrors.telephone = "Le numéro de téléphone est obligatoire";
      } else if (!phoneRegex.test(formData.telephone)) {
        newErrors.telephone = "Format de téléphone invalide";
      }
    } else if (step === 2) {
      // Validation du rôle
      if (!formData.role) newErrors.role = "Le rôle est obligatoire";

      // Validations spécifiques selon le rôle
      if (formData.role === ROLES.PARENT) {
        if (!formData.typeParent)
          newErrors.typeParent = "Le type de parent est obligatoire";
        if (!formData.lieuResidence)
          newErrors.lieuResidence = "Le lieu de résidence est obligatoire";
      } else if (formData.role === ROLES.ETUDIANT) {
        if (!formData.ine) newErrors.ine = "Le numéro INE est obligatoire";
        if (!formData.titreEtudiant)
          newErrors.titreEtudiant = "Le titre de l'étudiant est obligatoire";
        if (!formData.filiereId)
          newErrors.filiereId = "La filière est obligatoire";
      } else if (formData.role === ROLES.ENSEIGNANT) {
        if (!formData.matricule)
          newErrors.matricule = "Le matricule est obligatoire";
        if (!formData.typeEnseignant)
          newErrors.typeEnseignant = "Le type d'enseignant est obligatoire";
        if (!formData.grade) newErrors.grade = "Le grade est obligatoire";
        if (!formData.specialite)
          newErrors.specialite = "La spécialité est obligatoire";
      }
    } else if (step === 3) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) {
        newErrors.email = "L'email est obligatoire";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }

      if (!formData.password) {
        newErrors.password = "Le mot de passe est obligatoire";
      } else if (formData.password.length < 6) {
        newErrors.password =
          "Le mot de passe doit contenir au moins 6 caractères";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Rendu des champs en fonction de l'étape et du rôle
  const renderFormFields = () => {
    if (step === 1) {
      // Première étape: informations personnelles de base
      return (
        <>
          <InputField
            label="Nom"
            placeholder="Votre nom"
            value={formData.nom}
            onChangeText={(value) => updateFormData("nom", value)}
            error={errors.nom}
            styles={styles}
          />

          <InputField
            label="Prénom"
            placeholder="Votre prénom"
            value={formData.prenom}
            onChangeText={(value) => updateFormData("prenom", value)}
            error={errors.prenom}
            styles={styles}
          />

          <SelectField
            label="Sexe"
            selectedValue={formData.sexe}
            onValueChange={(value) => updateFormData("sexe", value)}
            items={SEXE}
            error={errors.sexe}
          />

          <InputField
            label="Téléphone"
            placeholder="+221 XXXXXXXX"
            value={formData.telephone}
            onChangeText={(value) => updateFormData("telephone", value)}
            error={errors.telephone}
            keyboardType="phone-pad"
            styles={styles}
          />
        </>
      );
    } else if (step === 2) {
      // Deuxième étape: sélection du rôle et champs spécifiques
      return (
        <>
          <SelectField
            label="Rôle"
            selectedValue={formData.role}
            onValueChange={(value) => updateFormData("role", value)}
            items={ROLES}
            error={errors.role}
          />

          {formData.role === ROLES.PARENT && (
            <>
              <SelectField
                label="Type de parent"
                selectedValue={formData.typeParent || ""}
                onValueChange={(value) => updateFormData("typeParent", value)}
                items={TYPE_PARENT}
                error={errors.typeParent}
              />

              <InputField
                label="Lieu de résidence"
                placeholder="Votre adresse de résidence"
                value={formData.lieuResidence || ""}
                onChangeText={(value) => updateFormData("lieuResidence", value)}
                error={errors.lieuResidence}
                styles={styles}
              />
            </>
          )}

          {formData.role === ROLES.ETUDIANT && (
            <>
              <InputField
                label="Numéro INE"
                placeholder="Votre numéro d'identification national"
                value={formData.ine || ""}
                onChangeText={(value) => updateFormData("ine", value)}
                error={errors.ine}
                styles={styles}
              />

              <SelectField
                label="Titre"
                selectedValue={formData.titreEtudiant || ""}
                onValueChange={(value) =>
                  updateFormData("titreEtudiant", value)
                }
                items={TITRE_ETUDIANT}
                error={errors.titreEtudiant}
              />

              <InputField
                label="ID Filière"
                placeholder="Identifiant de votre filière"
                value={formData.filiereId || ""}
                onChangeText={(value) => updateFormData("filiereId", value)}
                error={errors.filiereId}
                styles={styles}
              />

              <InputField
                label="ID Parent (optionnel)"
                placeholder="Identifiant du parent"
                value={formData.parentId || ""}
                onChangeText={(value) => updateFormData("parentId", value)}
                error={errors.parentId}
                styles={styles}
              />
            </>
          )}

          {formData.role === ROLES.ENSEIGNANT && (
            <>
              <InputField
                label="Matricule"
                placeholder="Votre matricule enseignant"
                value={formData.matricule || ""}
                onChangeText={(value) => updateFormData("matricule", value)}
                error={errors.matricule}
                styles={styles}
              />

              <SelectField
                label="Type d'enseignant"
                selectedValue={formData.typeEnseignant || ""}
                onValueChange={(value) =>
                  updateFormData("typeEnseignant", value)
                }
                items={TYPE_ENSEIGNANT}
                error={errors.typeEnseignant}
              />

              <InputField
                label="Grade"
                placeholder="Votre grade universitaire"
                value={formData.grade || ""}
                onChangeText={(value) => updateFormData("grade", value)}
                error={errors.grade}
                styles={styles}
              />

              <InputField
                label="Spécialité"
                placeholder="Votre domaine de spécialité"
                value={formData.specialite || ""}
                onChangeText={(value) => updateFormData("specialite", value)}
                error={errors.specialite}
                styles={styles}
              />
            </>
          )}
        </>
      );
    } else if (step === 3) {
      // Troisième étape: informations d'authentification
      return (
        <>
          <InputField
            label="Email"
            placeholder="votre@email.com"
            value={formData.email}
            onChangeText={(value) => updateFormData("email", value)}
            error={errors.email}
            keyboardType="email-address"
            styles={styles}
          />

          <InputField
            label="Mot de passe"
            placeholder="Votre mot de passe (6 caractères min.)"
            value={formData.password}
            onChangeText={(value) => updateFormData("password", value)}
            secureTextEntry
            error={errors.password}
            styles={styles}
          />
        </>
      );
    }
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
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>
            Créez votre compte en quelques étapes
          </Text>

          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((stepNumber) => (
              <View
                key={stepNumber}
                style={[
                  styles.stepDot,
                  step === stepNumber && styles.activeStepDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.form}>
          {renderFormFields()}

          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePrevious}
              >
                <Text style={styles.secondaryButtonText}>Précédent</Text>
              </TouchableOpacity>
            )}

            {step < 3 ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  step === 1 && styles.fullWidthButton,
                ]}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Suivant</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  step === 1 && styles.fullWidthButton,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={THEME.primaryForeground} />
                ) : (
                  <Text style={styles.primaryButtonText}>S'inscrire</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
          <TouchableOpacity onPress={() => router.navigate("/(auth)/login")}>
            <Text style={styles.loginText}>Se connecter</Text>
          </TouchableOpacity>
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
    marginBottom: 30,
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
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.muted,
    marginHorizontal: 5,
  },
  activeStepDot: {
    backgroundColor: THEME.primary,
    width: 12,
    height: 12,
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
  pickerContainer: {
    backgroundColor: THEME.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    height: 50,
    justifyContent: "center",
  },
  picker: {
    color: THEME.foreground,
    height: 50,
  },
  inputError: {
    borderColor: THEME.destructive,
  },
  errorText: {
    color: THEME.destructive,
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: THEME.primary,
    height: 50,
    flex: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: THEME.secondary,
    height: 50,
    flex: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  fullWidthButton: {
    marginLeft: 0,
  },
  primaryButtonText: {
    color: THEME.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: THEME.secondaryForeground,
    fontSize: 16,
    fontWeight: "600",
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
  loginText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  // Dans votre objet styles
  dropdownButton: {
    backgroundColor: THEME.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    height: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: THEME.foreground,
  },
  dropdownPlaceholder: {
    color: THEME.mutedForeground,
  },
  dropdownIcon: {
    fontSize: 12,
    color: THEME.mutedForeground,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.foreground,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: THEME.mutedForeground,
    fontWeight: "bold",
  },
  optionsList: {
    paddingHorizontal: 16,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  selectedOption: {
    backgroundColor: THEME.secondary,
  },
  optionText: {
    fontSize: 16,
    color: THEME.foreground,
  },
});

export default RegisterScreen;
