import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  AtSign,
  Camera,
  Car,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  Save,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import {
  exportIncidentToMail,
  exportIncidentToPdf,
} from "../../../services/exportService";
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
  const emailInputRef = useRef<TextInput>(null);

  // Solo el choque se envía a la aseguradora; el resto de los reportes usan
  // un correo de destino genérico (no todo problema tiene aseguradora).
  const isChoque = currentIncident?.flowId === "choque";

  useEffect(() => {
    if (isChoque && settings.insuranceEmail) {
      setRecipientEmail(settings.insuranceEmail);
    }
  }, [settings.insuranceEmail, isChoque]);

  const handleDownloadPdf = async () => {
    if (!currentIncident) return;
    setIsExporting(true);
    try {
      await exportIncidentToPdf(currentIncident);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendMail = async () => {
    if (!currentIncident) return;
    setIsExporting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const status = await exportIncidentToMail(
        currentIncident,
        recipientEmail.trim(),
      );
      // Si el usuario canceló el correo, se queda en el modal para reintentar.
      // Cualquier otro resultado (sent/saved/undetermined) cierra y vuelve al
      // inicio con confirmación.
      if (status && status !== "cancelled") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowSendModal(false);
        completeIncident();
        router.replace("/");
        Alert.alert(
          "¡Informe enviado!",
          "Tu reporte fue enviado correctamente y quedó guardado en el historial.",
        );
      }
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
            {Object.entries(responses).flatMap(([key, value]) => {
              if (!value) return [];
              // Arrays: si son fotos (uris), mostramos las miniaturas.
              if (Array.isArray(value)) {
                if (value.length === 0) return [];
                const imgs = value.filter(
                  (v): v is string =>
                    typeof v === "string" && v.startsWith("file://"),
                );
                if (imgs.length > 0) {
                  return [
                    <View key={key} style={styles.photoBlock}>
                      <Text style={styles.infoLabel}>{formatLabel(key)}:</Text>
                      <View style={styles.thumbRow}>
                        {imgs.map((uri, i) => (
                          <Image
                            key={i}
                            source={{ uri }}
                            style={[
                              styles.thumb,
                              { borderColor: theme.border },
                            ]}
                          />
                        ))}
                      </View>
                    </View>,
                  ];
                }
                return [
                  <View key={key} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{formatLabel(key)}:</Text>
                    <Text style={styles.infoValue}>
                      {value.length} elemento{value.length > 1 ? "s" : ""}
                    </Text>
                  </View>,
                ];
              }
              // Objetos (respuestas de FormStep) → aplanamos campo por campo.
              if (typeof value === "object") {
                return Object.entries(value as Record<string, unknown>)
                  .filter(([, v]) => typeof v === "string" && v)
                  .map(([subKey, subValue]) => (
                    <View key={`${key}-${subKey}`} style={styles.infoRow}>
                      <Text style={styles.infoLabel}>
                        {formatLabel(subKey)}:
                      </Text>
                      <Text style={styles.infoValue}>{String(subValue)}</Text>
                    </View>
                  ));
              }
              return [
                <View key={key} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{formatLabel(key)}:</Text>
                  <Text style={styles.infoValue}>{String(value)}</Text>
                </View>,
              ];
            })}
          </View>
        </View>

        {parties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <UserIcon size={18} color={theme.tint} />
              <Text style={styles.sectionTitle}>Involucrados</Text>
            </View>
            {parties.map((party) => {
              const partyPhotos = [
                party.photos?.dniFront,
                party.photos?.dniBack,
                party.photos?.licenseFront,
                party.photos?.licenseBack,
                party.photos?.plate,
                party.photos?.insurance,
                ...(party.photos?.damage || []),
              ].filter(Boolean) as string[];

              return (
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
                    {partyPhotos.length > 0 && (
                      <View style={styles.thumbRow}>
                        {partyPhotos.map((uri, i) => (
                          <Image
                            key={i}
                            source={{ uri }}
                            style={[
                              styles.thumb,
                              { borderColor: theme.border },
                            ]}
                          />
                        ))}
                      </View>
                    )}
                    <View style={styles.photoSummary}>
                      <Camera size={12} color={theme.text} opacity={0.5} />
                      <Text style={styles.photoCount}>
                        {partyPhotos.length} fotos de evidencia
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
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

      <Modal
        visible={showSendModal}
        animationType="slide"
        transparent={true}
        onShow={() => {
          // Foco directo al email solo si está vacío (si vino pre-cargado de
          // Ajustes, no molestamos con el teclado tapando los botones).
          if (!recipientEmail) {
            setTimeout(() => emailInputRef.current?.focus(), 80);
          }
        }}
      >
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
                {isChoque
                  ? "Los datos ya están seguros en tu dispositivo. ¿Deseás enviar el informe ahora a tu aseguradora?"
                  : "Los datos ya están seguros en tu dispositivo. Si querés, podés enviar el reporte por correo o descargarlo en PDF."}
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
                    {isChoque
                      ? "Correo de la Aseguradora"
                      : "Correo de destino (opcional)"}
                  </Text>
                </View>
                <TextInput
                  ref={emailInputRef}
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
                  {isExporting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Mail size={20} color="#fff" />
                  )}
                  <Text style={styles.primaryButtonText}>
                    {isExporting ? "Preparando informe..." : "Enviar Informe"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDownloadPdf}
                  disabled={isExporting}
                  style={[
                    styles.outlineButton,
                    {
                      borderColor: theme.tint,
                      borderWidth: 1.5,
                      opacity: isExporting ? 0.5 : 1,
                    },
                  ]}
                >
                  {isExporting ? (
                    <ActivityIndicator color={theme.tint} />
                  ) : (
                    <Download size={20} color={theme.tint} />
                  )}
                  <Text
                    style={[styles.outlineButtonText, { color: theme.tint }]}
                  >
                    Descargar Reporte PDF
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFinalExit}
                  disabled={isExporting}
                  style={[
                    styles.outlineButton,
                    {
                      borderColor: theme.border,
                      opacity: isExporting ? 0.5 : 1,
                    },
                  ]}
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
    backgroundColor: "transparent",
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
    borderBottomColor: "#FFFFFF15",
    paddingBottom: 12,
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  partyName: { fontSize: 18, fontWeight: "800" },
  cardBody: { gap: 10, backgroundColor: "transparent" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 2,
    backgroundColor: "transparent",
  },
  photoBlock: {
    paddingVertical: 6,
    backgroundColor: "transparent",
    gap: 4,
  },
  thumbRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
    backgroundColor: "transparent",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
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
    backgroundColor: "transparent",
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
