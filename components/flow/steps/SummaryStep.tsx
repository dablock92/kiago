import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Camera, Car, FileText, Mail, Save, AtSign } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Step } from "../../../engine/types";
import { useIncidentStore } from "../../../store/useIncidentStore";
import { useSettingsStore } from "../../../store/useSettingsStore";
import { exportIncidentToMail } from "../../../services/exportService";
import { saveIncidentToDb } from "../../../services/databaseService";

interface Props {
  step: Step;
}

const labelMap: Record<string, string> = {
  rol: "Tu Rol",
  seguridad_inmediata: "¿Había heridos?",
  cantidad_vehiculos: "Vehículos totales",
  fotos_escena: "Fotos de la escena",
  aseguradora: "Compañía de Seguro",
  poliza_num: "Nº de Póliza",
  vigencia_seguro: "Vigencia",
  dominio_patente: "Patente / Dominio",
  nombre_titular: "Titular del vehículo",
  conductor_nombre: "Nombre del Conductor",
  conductor_tel: "Teléfono",
};

export function SummaryStep({ step }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { currentIncident, completeIncident } = useIncidentStore();
  const { settings } = useSettingsStore();

  const [isExporting, setIsExporting] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  useEffect(() => {
    if (settings.insuranceEmail) {
      setRecipientEmail(settings.insuranceEmail);
    }
  }, [settings.insuranceEmail]);

  const handleSendMail = async () => {
    if (!currentIncident) return;
    setIsExporting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await exportIncidentToMail(currentIncident, recipientEmail);
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir la aplicación de correo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFinish = async () => {
    if (!currentIncident) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await saveIncidentToDb(currentIncident);
      completeIncident();
      router.replace("/");
    } catch (error) {
      console.error("Error saving to DB:", error);
      completeIncident();
      router.replace("/");
    }
  };

  const parties = currentIncident?.involvedParties || [];
  const responses = currentIncident?.responses || {};

  const formatLabel = (key: string) =>
    labelMap[key] ||
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={[styles.mainTitle, { color: theme.text }]}>
            Resumen del Incidente
          </Text>
          <Text style={styles.subtitle}>
            Verificá los datos antes de enviar
          </Text>
        </View>

        {/* Sección de Envío (NUEVA) */}
        <View
          style={[
            styles.emailSection,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.emailHeader}>
            <AtSign size={18} color={theme.tint} />
            <Text style={styles.emailTitle}>Correo de la Aseguradora</Text>
          </View>
          <TextInput
            style={[
              styles.emailInput,
              { color: theme.text, borderColor: theme.border },
            ]}
            placeholder="ej: denuncias@seguro.com"
            placeholderTextColor={theme.tabIconDefault}
            keyboardType="email-address"
            autoCapitalize="none"
            value={recipientEmail}
            onChangeText={setRecipientEmail}
          />
          <Text style={styles.emailHint}>
            Este es el destinatario que recibirá el informe completo con fotos.
          </Text>
        </View>

        {parties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <UserIcon size={18} color={theme.tint} />
              <Text style={styles.sectionTitle}>Vehículos Involucrados</Text>
            </View>
            {parties.map((party, idx) => (
              <View
                key={party.id}
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.partyName}>
                    {party.useDniPhoto
                      ? "Identidad por foto"
                      : `${party.name || "Sin nombre"} ${party.surname || ""}`}
                  </Text>
                  <Car size={18} color={theme.text} opacity={0.3} />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Compañía:</Text>
                    <Text style={styles.infoValue}>
                      {party.insuranceCompany || "No cargado"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Póliza:</Text>
                    <Text style={styles.infoValue}>
                      {party.policyNumber || "-"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Patente:</Text>
                    <Text style={styles.infoValue}>{party.plate || "-"}</Text>
                  </View>
                  <View style={styles.photoSummary}>
                    <Camera size={12} color={theme.text} opacity={0.5} />
                    <Text style={styles.photoCount}>
                      {(party.photos.damage?.length || 0) +
                        (party.photos.dniFront ? 2 : 0) +
                        (party.photos.license ? 1 : 0)}{" "}
                      fotos de evidencia
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={theme.tint} />
            <Text style={styles.sectionTitle}>Detalles del hecho</Text>
          </View>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {Object.entries(responses).map(([key, value]) => {
              if (typeof value === "object") return null;
              return (
                <View key={key} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{formatLabel(key)}:</Text>
                  <Text style={styles.infoValue}>{String(value)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={handleSendMail}
          disabled={isExporting}
          style={[styles.outlineButton, { borderColor: theme.border }]}
        >
          <Mail size={20} color={theme.text} />
          <Text style={[styles.outlineButtonText, { color: theme.text }]}>
            Enviar Informe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFinish}
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
        >
          <Save size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Guardar y Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const UserIcon = ({ size, color }: { size: number; color: string }) => (
  <View style={{ backgroundColor: "transparent" }}>
    <FileText size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  mainTitle: { fontSize: 28, fontWeight: "900", textAlign: "left" },
  subtitle: { fontSize: 15, opacity: 0.5, fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  emailSection: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  emailHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  emailTitle: { fontSize: 16, fontWeight: "800" },
  emailInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
  emailHint: { fontSize: 12, opacity: 0.5, fontWeight: "500" },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#00000005",
    paddingBottom: 12,
    marginBottom: 12,
  },
  partyName: { fontSize: 18, fontWeight: "800" },
  cardBody: { gap: 10 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.5,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  infoValue: { fontSize: 14, fontWeight: "700", textAlign: "right", flex: 1.5 },
  photoSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: "#00000005",
    padding: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  photoCount: { fontSize: 11, fontWeight: "bold", opacity: 0.4 },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#00000010",
  },
  primaryButton: {
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  primaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  outlineButton: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  outlineButtonText: { fontSize: 18, fontWeight: "bold" },
});
