import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import {
  AlertCircle,
  Calendar,
  Camera as CameraIcon,
  Check,
  CheckCircle2,
  Circle,
  ThumbsDown,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
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
import { ChecklistItem, Step } from "../../../engine/types";
import {
  InvolvedParty,
  useIncidentStore,
} from "../../../store/useIncidentStore";
import { CameraView } from "../CameraView";

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
  partyId?: string;
}

const isImageUri = (val: any): boolean => {
  return typeof val === "string" && val.startsWith("file://");
};

export function ChecklistStep({ step, onNext, partyId }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { currentIncident, updateResponse, updateInvolvedParty } =
    useIncidentStore();

  const [activeItem, setActiveItem] = useState<ChecklistItem | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraSide, setCameraSide] = useState<"front" | "back" | null>(null);
  const [useDniPhotoLocal, setUseDniPhotoLocal] = useState(false);
  const [tempDniPhotos, setTempDniPhotos] = useState<{
    front?: string;
    back?: string;
  }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estado local para el texto de "Otro" motivo
  const [otherReasonText, setOtherReasonText] = useState("");

  const currentParty = useMemo(
    () =>
      partyId
        ? currentIncident?.involvedParties.find((p) => p.id === partyId)
        : null,
    [partyId, currentIncident],
  );

  useEffect(() => {
    if (activeItem?.id === "dni_photos" && currentParty) {
      setTempDniPhotos({
        front: currentParty.photos?.dniFront,
        back: currentParty.photos?.dniBack,
      });
    }
  }, [activeItem, currentParty]);

  const items = useMemo(() => {
    return (step?.checklistItems || []).map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `item-${index}`,
          label: item,
          type: "info",
        } as ChecklistItem;
      }
      return item;
    });
  }, [step]);

  const responses = useMemo(() => {
    if (partyId && currentParty) {
      return {
        aseguradora: currentParty.insuranceCompany,
        poliza_num: currentParty.policyNumber,
        vigencia_seguro: currentParty.insuranceValidity,
        dominio_patente: currentParty.plate,
        nombre_titular: currentParty.ownerName,
        conductor_nombre: currentParty.name
          ? `${currentParty.name} ${currentParty.surname}`
          : undefined,
        conductor_tel: currentParty.phone,
        dni_photos:
          currentParty.photos?.dniFront && currentParty.photos?.dniBack
            ? "AMBOS_LADOS"
            : undefined,
        licencia_img: currentParty.photos?.license,
        fotos_danos:
          (currentParty.photos?.damage?.length || 0) > 0
            ? `${currentParty.photos?.damage?.length} fotos`
            : undefined,
      } as Record<string, any>;
    }
    return currentIncident?.responses?.[step?.id] || {};
  }, [currentIncident, step, partyId, currentParty]);

  const handleToggleUnavailable = (itemId: string) => {
    if (!partyId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const currentUnavailable = currentParty?.unavailableFields || [];
    const isUnavailable = currentUnavailable.includes(itemId);
    const newUnavailable = isUnavailable
      ? currentUnavailable.filter((id) => id !== itemId)
      : [...currentUnavailable, itemId];

    updateInvolvedParty(partyId, {
      unavailableFields: newUnavailable,
      ...(!isUnavailable
        ? {
            insuranceCompany:
              itemId === "aseguradora"
                ? undefined
                : currentParty?.insuranceCompany,
            policyNumber:
              itemId === "poliza_num" ? undefined : currentParty?.policyNumber,
            insuranceValidity:
              itemId === "vigencia_seguro"
                ? undefined
                : currentParty?.insuranceValidity,
            plate:
              itemId === "dominio_patente" ? undefined : currentParty?.plate,
            ownerName:
              itemId === "nombre_titular" ? undefined : currentParty?.ownerName,
            phone: itemId === "conductor_tel" ? undefined : currentParty?.phone,
          }
        : {}),
    });
    setActiveItem(null);
  };

  const allCompleted = useMemo(() => {
    const requiredItems = items.filter((i) => i.required);
    const unavailableFields = currentParty?.unavailableFields || [];
    return requiredItems.every(
      (item) => !!responses[item.id] || unavailableFields.includes(item.id),
    );
  }, [items, responses, currentParty?.unavailableFields]);

  const handleItemPress = (item: ChecklistItem) => {
    if (item.type === "section") return;
    if (currentParty?.unavailableFields?.includes(item.id)) {
      handleToggleUnavailable(item.id);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveItem(item);
    const val = responses[item.id] || "";
    setFormData(item.fields ? {} : { [item.id]: String(val) });
    setIsPhotoMode(item.type === "photo" || isImageUri(responses[item.id]));
  };

  const handleSaveItem = (valueOverride?: string) => {
    if (!activeItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let finalValue = valueOverride;
    if (!finalValue) {
      if (activeItem.fields) {
        finalValue = activeItem.fields
          .map((f) => formData[f.id])
          .filter(Boolean)
          .join(" ");
      } else {
        finalValue = formData[activeItem.id];
      }
    }

    if (partyId) {
      const update: Partial<InvolvedParty> = {};
      const photosUpdate = { ...(currentParty?.photos || {}) };

      if (activeItem.id === "conductor_nombre") {
        update.name = formData["nombre"];
        update.surname = formData["apellido"];
        update.useDniPhoto = useDniPhotoLocal;
      } else if (activeItem.id === "aseguradora")
        update.insuranceCompany = finalValue;
      else if (activeItem.id === "poliza_num") update.policyNumber = finalValue;
      else if (activeItem.id === "vigencia_seguro")
        update.insuranceValidity = finalValue;
      else if (activeItem.id === "dominio_patente") update.plate = finalValue;
      else if (activeItem.id === "nombre_titular")
        update.ownerName = finalValue;
      else if (activeItem.id === "conductor_tel") update.phone = finalValue;
      else if (activeItem.id === "licencia_img")
        photosUpdate.license = finalValue;
      else if (activeItem.id === "dni_photos") {
        photosUpdate.dniFront = tempDniPhotos.front;
        photosUpdate.dniBack = tempDniPhotos.back;
      } else if (activeItem.id === "fotos_danos") {
        photosUpdate.damage = [...(photosUpdate.damage || []), finalValue!];
      }

      update.photos = photosUpdate;
      const newUnavailable = (currentParty?.unavailableFields || []).filter(
        (id) => id !== activeItem.id,
      );
      update.unavailableFields = newUnavailable;
      updateInvolvedParty(partyId, update);
    }
    if (activeItem.id !== "fotos_danos" || !valueOverride) {
      setActiveItem(null);
    }
  };

  const hasUnavailableFields =
    (currentParty?.unavailableFields?.length || 0) > 0;

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && activeItem) {
      const dateString = selectedDate.toLocaleDateString("es-AR");
      setFormData({ [activeItem.id]: dateString });
    }
  };

  const handleSelectReason = (reason: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (reason === "Otro") {
      updateInvolvedParty(partyId!, { missingDataReason: "Otro" });
    } else {
      updateInvolvedParty(partyId!, { missingDataReason: reason });
      setOtherReasonText("");
    }
  };

  const isSelected = (reason: string) =>
    currentParty?.missingDataReason?.startsWith(reason);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {items.map((item, index) => {
            const isUnavailable = currentParty?.unavailableFields?.includes(
              item.id,
            );
            const isDone = !!responses[item.id] || isUnavailable;
            const value = responses[item.id];

            if (item.type === "section") {
              return (
                <View key={`${item.id}-${index}`} style={styles.sectionHeader}>
                  <Text
                    style={[
                      styles.sectionLabel,
                      { color: theme.tabIconDefault },
                    ]}
                  >
                    {item?.label}
                  </Text>
                  <View
                    style={[
                      styles.sectionLine,
                      { backgroundColor: theme.border },
                    ]}
                  />
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={`${item.id}-${index}`}
                onPress={() => handleItemPress(item)}
                style={[
                  styles.item,
                  {
                    backgroundColor: isUnavailable
                      ? theme.border + "15"
                      : "transparent",
                    borderColor: isDone
                      ? isUnavailable
                        ? "#F59E0B"
                        : "#10B981"
                      : theme.border,
                    opacity: isUnavailable ? 0.6 : 1,
                  },
                ]}
              >
                <View style={styles.itemContent}>
                  {isDone ? (
                    isUnavailable ? (
                      <ThumbsDown size={24} color="#F59E0B" />
                    ) : (
                      <CheckCircle2 size={24} color="#10B981" />
                    )
                  ) : (
                    <Circle size={24} color={theme.text} opacity={0.3} />
                  )}
                  <View style={styles.textContainer}>
                    <View style={styles.labelRow}>
                      <Text
                        style={[styles.itemLabel, isDone && styles.itemDone]}
                      >
                        {item?.label}
                      </Text>
                      {item?.required && !isDone && (
                        <Text style={styles.asterisk}>*</Text>
                      )}
                    </View>
                    {item.hint && !isDone && (
                      <Text style={styles.hintText}>{item.hint}</Text>
                    )}
                    {isDone && !isUnavailable && (
                      <Text numberOfLines={1} style={styles.itemValueText}>
                        {value}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {hasUnavailableFields && (
            <View
              style={[
                styles.missingDataCard,
                { backgroundColor: theme.card, borderColor: "#F59E0B" },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "transparent",
                }}
              >
                <AlertCircle size={20} color="#F59E0B" />
                <Text style={styles.missingDataTitle}>
                  Datos obligatorios faltantes
                </Text>
              </View>
              <Text style={styles.missingDataSub}>
                Indica el motivo por el cual no pudiste obtener los datos
              </Text>
              <Text
                style={[
                  styles.missingDataSub,
                  { fontWeight: "bold", marginTop: 8 },
                ]}
              >
                El involucrado...
              </Text>

              <View style={styles.chipsRow}>
                {[
                  "Se dio a la fuga",
                  "Estaba agresivo",
                  "No quiso cooperar",
                  "Otro",
                ].map((reason) => {
                  const active = isSelected(reason);
                  return (
                    <TouchableOpacity
                      key={reason}
                      onPress={() => handleSelectReason(reason)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active
                            ? "transparent"
                            : theme.border + "30",
                          borderColor: active ? "#F59E0B" : theme.border + "50",
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          width: "100%",
                          backgroundColor: "transparent",
                        }}
                      >
                        {active ? (
                          <CheckCircle2 size={22} color="#F59E0B" />
                        ) : (
                          <Circle size={22} color={theme.text} opacity={0.3} />
                        )}
                        <Text
                          style={[
                            styles.chipText,
                            active && { color: "#F59E0B", fontWeight: "bold" },
                          ]}
                        >
                          {reason}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isSelected("Otro") && (
                <TextInput
                  style={[
                    styles.missingDataInput,
                    { color: theme.text, borderColor: "#F59E0B" },
                  ]}
                  placeholder="Escriba el motivo..."
                  placeholderTextColor={theme.tabIconDefault}
                  multiline
                  autoFocus
                  value={
                    currentParty?.missingDataReason === "Otro"
                      ? ""
                      : currentParty?.missingDataReason?.replace("Otro: ", "")
                  }
                  onChangeText={(text) =>
                    updateInvolvedParty(partyId!, {
                      missingDataReason: `Otro: ${text}`,
                    })
                  }
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => onNext(step.nextStep)}
        disabled={!allCompleted}
        style={[
          styles.nextButton,
          { backgroundColor: allCompleted ? theme.tint : theme.border },
        ]}
      >
        <Text style={styles.nextButtonText}>
          {partyId ? "Cerrar Ficha" : "Continuar"}
        </Text>
      </TouchableOpacity>

      <Modal visible={!!activeItem} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{activeItem?.label}</Text>
                {activeItem?.hint && (
                  <Text style={styles.modalHint}>{activeItem.hint}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setActiveItem(null)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              {activeItem?.fields ? (
                <View style={styles.fieldsGrid}>
                  {activeItem.fields.map((field) => (
                    <View key={field.id} style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                            color: theme.text,
                          },
                        ]}
                        placeholder={field.placeholder || field.label}
                        placeholderTextColor={theme.tabIconDefault}
                        value={formData[field.id]}
                        onChangeText={(text) =>
                          setFormData({ ...formData, [field.id]: text })
                        }
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.inputWrapper}>
                  {!isPhotoMode ? (
                    activeItem?.type === "date" ? (
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: formData[activeItem.id]
                              ? theme.text
                              : theme.tabIconDefault,
                            fontSize: 18,
                          }}
                        >
                          {formData[activeItem.id] ||
                            activeItem.placeholder ||
                            "Seleccionar fecha"}
                        </Text>
                        <Calendar size={24} color={theme.tint} />
                      </TouchableOpacity>
                    ) : (
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                            color: theme.text,
                          },
                        ]}
                        placeholder={
                          activeItem?.placeholder || "Escribir aquí..."
                        }
                        placeholderTextColor={theme.tabIconDefault}
                        value={formData[activeItem?.id || ""]}
                        onChangeText={(text) =>
                          setFormData({ [activeItem?.id || ""]: text })
                        }
                        autoFocus
                      />
                    )
                  ) : (
                    <TouchableOpacity
                      onPress={() => setShowCamera(true)}
                      style={[
                        styles.photoButton,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <CameraIcon size={48} color={theme.tint} />
                      <Text style={styles.photoText}>Tomar Foto</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={{ gap: 12, marginTop: 10 }}>
                {activeItem?.required && (
                  <TouchableOpacity
                    onPress={() => handleToggleUnavailable(activeItem.id)}
                    style={[
                      styles.unavailableAction,
                      { borderColor: "transparent" },
                    ]}
                  >
                    <ThumbsDown size={20} color={theme.tint} />
                    <Text
                      style={[
                        styles.unavailableActionText,
                        { color: theme.tint, opacity: 0.5 },
                      ]}
                    >
                      No logré obtenerlo
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleSaveItem()}
                  style={[styles.saveButton, { backgroundColor: theme.tint }]}
                >
                  <Check size={24} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </Modal>

      <Modal visible={showCamera} animationType="fade" transparent={false}>
        <CameraView
          onClose={() => {
            setShowCamera(false);
            setCameraSide(null);
          }}
          onCapture={(uri) => {
            if (activeItem?.id === "dni_photos") {
              setTempDniPhotos((prev) => ({ ...prev, [cameraSide!]: uri }));
              setShowCamera(false);
            } else {
              handleSaveItem(uri);
              setShowCamera(false);
            }
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1 },
  list: { padding: 20, gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionLine: { flex: 1, height: 1, opacity: 0.5 },
  item: { padding: 16, borderRadius: 24, borderWidth: 2 },
  itemContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  textContainer: { flex: 1 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  itemLabel: { fontSize: 16, fontWeight: "700" },
  hintText: { fontSize: 12, opacity: 0.5, fontStyle: "italic", marginTop: 2 },
  itemDone: { opacity: 0.5 },
  itemValueText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "bold",
    marginTop: 2,
  },
  asterisk: { color: "#EF4444", fontSize: 18, fontWeight: "bold" },
  missingDataCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    gap: 12,
  },
  missingDataTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F59E0B",
    backgroundColor: "transparent",
  },
  missingDataSub: { fontSize: 13, opacity: 0.6, marginBottom: 4 },
  chipsRow: {
    gap: 10,
    marginBottom: 12,
    marginTop: 8,
    backgroundColor: "transparent",
  },
  chip: {
    width: "100%",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    backgroundColor: "transparent",
  },
  chipText: { fontSize: 15, fontWeight: "600" },
  missingDataInput: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: 8,
  },
  nextButton: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    margin: 20,
  },
  nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold" },
  modalHint: { fontSize: 14, opacity: 0.5, fontStyle: "italic", marginTop: 2 },
  inputContainer: { gap: 16 },
  fieldsGrid: { gap: 12 },
  fieldWrapper: { gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: "bold", opacity: 0.6 },
  inputWrapper: { width: "100%" },
  input: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 18,
  },
  photoButton: {
    height: 120,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  photoText: { fontSize: 16, fontWeight: "bold", opacity: 0.5 },
  saveButton: {
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  unavailableAction: {
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  unavailableActionText: { fontSize: 16, fontWeight: "bold" },
});
