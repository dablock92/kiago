import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  AtSign,
  Car,
  CheckCircle2,
  FileText,
  Mail,
  Save,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Step } from "../../../engine/types";
import { saveIncidentToDb } from "../../../services/databaseService";
import { exportIncidentToMail } from "../../../services/exportService";
import { useIncidentStore } from "../../../store/useIncidentStore";
import { useSettingsStore } from "../../../store/useSettingsStore";
import { flows } from "@/data/flows";

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
  conductor_email: "Correo del Conductor",
};

export function SummaryStep({ step }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { currentIncident, completeIncident } = useIncidentStore();
  const { settings } = useSettingsStore();

  const responses = currentIncident?.responses || {};
  const isSpectator = responses["rol"] === "Soy un espectador";
  const flow = (flows || []).find((f) => f.id === currentIncident?.flowId);

  const [isExporting, setIsExporting] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showSendModal, setShowSendModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSpectator && settings.insuranceEmail) {
      setRecipientEmail(settings.insuranceEmail);
    } else if (isSpectator) {
      setRecipientEmail("");
    }
  }, [settings.insuranceEmail, isSpectator]);

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

  const formatLabel = (key: string) =>
    labelMap[key] ||
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
              if (typeof value === "object" && value !== null) {
                const matchingStep = flow?.steps.find((s) => s.id === key);
                if (matchingStep && matchingStep.type === "checklist") {
                  return (
                    <View
                      key={key}
                      style={{
                        marginTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: theme.border + "40",
                        paddingTop: 10,
                      }}
                    >
                      <Text
                        style={[
                          styles.infoLabel,
                          {
                            fontWeight: "bold",
                            marginBottom: 6,
                            color: theme.tint,
                          },
                        ]}
                      >
                        {matchingStep.text}:
                      </Text>
                      {Object.entries(value).map(([itemId, itemValue]) => {
                        const checklistItem = matchingStep.checklistItems?.find(
                          (item) =>
                            typeof item !== "string" && item.id === itemId,
                        );
                        const label =
                          typeof checklistItem === "object" && checklistItem
                            ? checklistItem.label
                            : itemId;

                        return (
                          <View
                            key={itemId}
                            style={[
                              styles.infoRow,
                              { paddingLeft: 10, paddingVertical: 4 },
                            ]}
                          >
                            <Text style={styles.infoLabel}>• {label}:</Text>
                            {Array.isArray(itemValue) ? (
                              <View style={styles.thumbnailGrid}>
                                {itemValue.map((uri, idx) => (
                                  <TouchableOpacity
                                    key={idx}
                                    onPress={() => setPreviewImage(uri)}
                                  >
                                    <Image
                                      source={{ uri }}
                                      style={[
                                        styles.thumbnail,
                                        { borderColor: theme.border },
                                      ]}
                                    />
                                  </TouchableOpacity>
                                ))}
                              </View>
                            ) : String(itemValue).startsWith("file://") ? (
                              <TouchableOpacity
                                onPress={() =>
                                  setPreviewImage(String(itemValue))
                                }
                              >
                                <Image
                                  source={{ uri: String(itemValue) }}
                                  style={[
                                    styles.thumbnail,
                                    { borderColor: theme.border },
                                  ]}
                                />
                              </TouchableOpacity>
                            ) : (
                              <Text style={styles.infoValue}>
                                {String(itemValue)}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  );
                }
                return null;
              }
              return (
                <View key={key} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{formatLabel(key)}:</Text>
                  {String(value).startsWith("file://") ? (
                    <TouchableOpacity
                      onPress={() => setPreviewImage(String(value))}
                    >
                      <Image
                        source={{ uri: String(value) }}
                        style={[
                          styles.thumbnail,
                          { borderColor: theme.border },
                        ]}
                      />
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.infoValue}>{String(value)}</Text>
                  )}
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
                    {party.insuranceCompany ? (
                      party.insuranceCompany.startsWith("file://") ? (
                        <TouchableOpacity
                          onPress={() =>
                            setPreviewImage(party.insuranceCompany || null)
                          }
                        >
                          <Image
                            source={{ uri: party.insuranceCompany }}
                            style={[
                              styles.thumbnail,
                              { borderColor: theme.border },
                            ]}
                          />
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.infoValue}>
                          {party.insuranceCompany}
                        </Text>
                      )
                    ) : (
                      <Text style={styles.infoValue}>No cargado</Text>
                    )}
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Póliza:</Text>
                    {party.policyNumber ? (
                      party.policyNumber.startsWith("file://") ? (
                        <TouchableOpacity
                          onPress={() =>
                            setPreviewImage(party.policyNumber || null)
                          }
                        >
                          <Image
                            source={{ uri: party.policyNumber }}
                            style={[
                              styles.thumbnail,
                              { borderColor: theme.border },
                            ]}
                          />
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.infoValue}>
                          {party.policyNumber}
                        </Text>
                      )
                    ) : (
                      <Text style={styles.infoValue}>-</Text>
                    )}
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Patente:</Text>
                    {party.plate ? (
                      party.plate.startsWith("file://") ? (
                        <TouchableOpacity
                          onPress={() => setPreviewImage(party.plate || null)}
                        >
                          <Image
                            source={{ uri: party.plate }}
                            style={[
                              styles.thumbnail,
                              { borderColor: theme.border },
                            ]}
                          />
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.infoValue}>{party.plate}</Text>
                      )
                    ) : (
                      <Text style={styles.infoValue}>-</Text>
                    )}
                  </View>
                  {party.ownerName && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Titular:</Text>
                      {party.ownerName.startsWith("file://") ? (
                        <TouchableOpacity
                          onPress={() =>
                            setPreviewImage(party.ownerName || null)
                          }
                        >
                          <Image
                            source={{ uri: party.ownerName }}
                            style={[
                              styles.thumbnail,
                              { borderColor: theme.border },
                            ]}
                          />
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.infoValue}>{party.ownerName}</Text>
                      )}
                    </View>
                  )}
                  {party.email && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoValue}>{party.email}</Text>
                    </View>
                  )}

                  {/* Grid de evidencia fotográfica para DNI, licencia y daños */}
                  {(() => {
                    const docPhotos: { uri: string; label: string }[] = [];
                    if (party.photos?.dniFront)
                      docPhotos.push({
                        uri: party.photos.dniFront,
                        label: "DNI Frente",
                      });
                    if (party.photos?.dniBack)
                      docPhotos.push({
                        uri: party.photos.dniBack,
                        label: "DNI Dorso",
                      });
                    if (party.photos?.licenseFront)
                      docPhotos.push({
                        uri: party.photos.licenseFront,
                        label: "Lic. Frente",
                      });
                    if (party.photos?.licenseBack)
                      docPhotos.push({
                        uri: party.photos.licenseBack,
                        label: "Lic. Dorso",
                      });
                    if (party.photos?.damage) {
                      party.photos.damage.forEach((uri, i) => {
                        docPhotos.push({ uri, label: `Daño ${i + 1}` });
                      });
                    }

                    if (docPhotos.length === 0) return null;

                    return (
                      <View
                        style={{
                          marginTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: theme.border + "30",
                          paddingTop: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "bold",
                            color: theme.tint,
                            marginBottom: 8,
                          }}
                        >
                          Evidencia fotográfica cargada:
                        </Text>
                        <View style={styles.thumbnailGrid}>
                          {docPhotos.map((item, i) => (
                            <View
                              key={i}
                              style={{ alignItems: "center", gap: 4 }}
                            >
                              <TouchableOpacity
                                onPress={() => setPreviewImage(item.uri)}
                              >
                                <Image
                                  source={{ uri: item.uri }}
                                  style={[
                                    styles.thumbnail,
                                    { borderColor: theme.border },
                                  ]}
                                />
                              </TouchableOpacity>
                              <Text
                                style={{
                                  fontSize: 9,
                                  opacity: 0.6,
                                  color: theme.text,
                                }}
                              >
                                {item.label}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })()}
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
                {isSpectator
                  ? "Los datos ya están seguros en tu dispositivo. Este reporte que realizaste puede ser de gran ayuda para la persona involucrada, pedile el correo y enviale estos datos o guardalos para darselos en un futuro."
                  : "Los datos ya están seguros en tu dispositivo. ¿Deseás enviar el informe ahora a tu aseguradora?"}
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
                    {isSpectator
                      ? "Correo del involucrado"
                      : "Correo de la Aseguradora"}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.emailInput,
                    { color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder={
                    isSpectator
                      ? "ej: involucrado@correo.com"
                      : "ej: denuncias@seguro.com"
                  }
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

      {previewImage && (
        <Modal
          transparent
          visible={!!previewImage}
          animationType="fade"
          onRequestClose={() => setPreviewImage(null)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.92)",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPress={() => setPreviewImage(null)}
          >
            <View
              style={{
                width: "90%",
                height: "80%",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Image
                source={{ uri: previewImage }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 16,
                }}
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => setPreviewImage(null)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
  thumbnailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    backgroundColor: "transparent",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
  },
});
