import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  AtSign,
  Camera,
  Car,
  CheckCircle2,
  FileText,
  Mail,
  Save,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Step } from "../../../engine/types";
import { saveIncidentToDb } from "../../../services/databaseService";
import { exportIncidentToMail } from "../../../services/exportService";
import { useIncidentStore } from "../../../store/useIncidentStore";
import { useSettingsStore } from "../../../store/useSettingsStore";

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
  const [showSendModal, setShowSendModal] = useState(false);

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
      await exportIncidentToMail(currentIncident, recipientEmail.trim());
    } catch {
      Alert.alert("Error", "No se pudo abrir la aplicación de correo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveAndConfirm = async () => {
    if (!currentIncident) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await saveIncidentToDb(currentIncident);
      setShowSendModal(true);
    } catch (error) {
      console.error("Error saving to DB:", error);
      Alert.alert(
        "Aviso",
        "El reporte no pudo guardarse localmente, pero podés intentar enviarlo por correo.",
        [{ text: "Continuar", onPress: () => setShowSendModal(true) }],
      );
    }
  };

  const handleFinalExit = () => {
    completeIncident();
    router.replace("/");
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
          <Text style={styles.subtitle}>
            Verificá los datos antes de enviar
          </Text>
        </View>

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

        {parties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <UserIcon size={18} color={theme.tint} />
              <Text style={styles.sectionTitle}>Involucrados</Text>
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
                        (party.photos.dniFront ? 1 : 0) +
                        (party.photos.dniBack ? 1 : 0) +
                        (party.photos.licenseFront ? 1 : 0) +
                        (party.photos.licenseBack ? 1 : 0) +
                        (party.photos.plate ? 1 : 0)}{" "}
                      fotos de evidencia
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={handleSaveAndConfirm}
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
        >
          <Save size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Guardar y Finalizar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showSendModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <View style={styles.modalHeader}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <CheckCircle2 size={24} color="#10B981" />
                <Text style={styles.modalTitle}>¡Reporte Guardado!</Text>
              </View>
              <TouchableOpacity onPress={handleFinalExit}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalText, { color: theme.text }]}>
                Los datos ya están seguros en tu dispositivo. ¿Deseás enviar el
                informe ahora a tu aseguradora?
              </Text>

              <View
                style={[
                  styles.emailSection,
                  {
                    backgroundColor: theme.card,
                    borderColor: !recipientEmail ? "#F59E0B" : theme.border,
                    borderWidth: !recipientEmail ? 2 : 1,
                    marginTop: 20,
                  },
                ]}
              >
                <View style={styles.emailHeader}>
                  <AtSign
                    size={18}
                    color={!recipientEmail ? "#F59E0B" : theme.tint}
                  />
                  <Text style={styles.emailTitle}>
                    Correo de la Aseguradora
                  </Text>
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
              </View>

              <View style={{ gap: 12, marginTop: 24 }}>
                <TouchableOpacity
                  onPress={handleSendMail}
                  disabled={
                    isExporting ||
                    !recipientEmail.trim() ||
                    !recipientEmail.includes("@")
                  }
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: theme.tint,
                      opacity:
                        !recipientEmail.trim() || !recipientEmail.includes("@")
                          ? 0.5
                          : 1,
                    },
                  ]}
                >
                  <Mail size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Enviar Informe</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFinalExit}
                  style={[styles.outlineButton, { borderColor: theme.border }]}
                >
                  <Text
                    style={[styles.outlineButtonText, { color: theme.text }]}
                  >
                    Finalizar sin enviar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  emailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  emailTitle: {
    fontSize: 16,
    fontWeight: "800",
    backgroundColor: "transparent",
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  modalBody: {
    gap: 12,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
  },
});
