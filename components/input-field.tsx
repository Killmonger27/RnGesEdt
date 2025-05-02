import { THEME } from "@/constants/Colors";
import { View, TextInput, Text, KeyboardTypeOptions } from "react-native";

// Composant pour le champ de saisie
export const InputField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  styles?: any;
  keyboardType?: KeyboardTypeOptions;
}> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  styles,
  keyboardType = "default",
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={THEME.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
