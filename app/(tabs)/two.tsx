import {
  AtSign,
  Car,
  FileText,
  Globe,
  Languages,
  MapPin,
  Shield,
  User,
} from "lucide-react-native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useConfigStore } from "../../store/useConfigStore";
import { useSettingsStore } from "../../store/useSettingsStore";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { country, province, language } = useConfigStore();
  const { settings, updateSettings } = useSettingsStore();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Cargá tus datos una sola vez y usalos en todos tus reportes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.tint }]}>
            Mis datos
          </Text>

          <EditableItem
            icon={<User size={20} color={theme.text} />}
            label="Nombre y apellido"
            placeholder="Ej: Juan Pérez"
            value={settings.userName}
            onChange={(text) => updateSettings({ userName: text })}
          />

          <EditableItem
            icon={<AtSign size={20} color={theme.text} />}
            label="Tu email"
            placeholder="Ej: juan@mail.com"
            value={settings.userEmail}
            onChange={(text) => updateSettings({ userEmail: text })}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.tint }]}>
            Mi vehículo y seguro
          </Text>

          <EditableItem
            icon={<Car size={20} color={theme.text} />}
            label="Patente / Dominio"
            placeholder="Ej: AF 123 BK"
            value={settings.userPlate}
            onChange={(text) => updateSettings({ userPlate: text })}
            autoCapitalize="characters"
          />

          <EditableItem
            icon={<Shield size={20} color={theme.text} />}
            label="Aseguradora"
            placeholder="Ej: La Caja"
            value={settings.insuranceName}
            onChange={(text) => updateSettings({ insuranceName: text })}
          />

          <EditableItem
            icon={<FileText size={20} color={theme.text} />}
            label="Nº de póliza"
            placeholder="Ej: 0012345678"
            value={settings.userPolicy}
            onChange={(text) => updateSettings({ userPolicy: text })}
          />

          <EditableItem
            icon={<AtSign size={20} color={theme.text} />}
            label="Email de la aseguradora"
            placeholder="Ej: denuncias@seguro.com"
            hint="Se usa para pre-cargar el envío de tus reportes."
            value={settings.insuranceEmail}
            onChange={(text) => updateSettings({ insuranceEmail: text })}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.tint }]}>
            Localización
          </Text>

          <ReadOnlyItem
            icon={<Globe size={20} color={theme.text} />}
            label="País"
            value={country}
          />

          <ReadOnlyItem
            icon={<MapPin size={20} color={theme.text} />}
            label="Provincia / Estado"
            value={province}
          />

          <ReadOnlyItem
            icon={<Languages size={20} color={theme.text} />}
            label="Idioma"
            value={language}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Modo Crisis v1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EditableItem({
  icon,
  label,
  value,
  placeholder,
  hint,
  onChange,
  keyboardType,
  autoCapitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  onChange: (text: string) => void;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "characters" | "sentences" | "words";
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[
        styles.item,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
          {icon}
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.itemLabel}>{label}</Text>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={placeholder}
            placeholderTextColor={theme.tabIconDefault}
            value={value}
            onChangeText={onChange}
            onEndEditing={(e) => onChange(e.nativeEvent.text.trim())}
            keyboardType={keyboardType || "default"}
            autoCapitalize={
              autoCapitalize ||
              (keyboardType === "email-address" ? "none" : "sentences")
            }
          />
          {hint ? <Text style={styles.itemHint}>{hint}</Text> : null}
        </View>
      </View>
    </View>
  );
}

function ReadOnlyItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[
        styles.item,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: 0.6,
        },
      ]}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
          {icon}
        </View>
        <View style={{ backgroundColor: "transparent" }}>
          <Text style={styles.itemLabel}>{label}</Text>
          <Text style={styles.itemValue}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "transparent",
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "transparent",
    gap: 2,
  },
  itemLabel: {
    fontSize: 14,
    opacity: 0.5,
    fontWeight: "500",
  },
  itemValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 4,
  },
  itemHint: {
    fontSize: 11,
    opacity: 0.4,
    fontStyle: "italic",
  },
  footer: {
    alignItems: "center",
    padding: 40,
  },
  version: {
    fontSize: 12,
    opacity: 0.3,
  },
});
