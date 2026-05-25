import DateTimePicker from "@react-native-community/datetimepicker";
// REFRESH METRO 1
import * as Haptics from "expo-haptics";
import {
  AlertCircle,
  Calendar,
  Camera as CameraIcon,
  Check,
  CheckCircle2,
  Circle,
  Phone,
  ThumbsDown,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
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

const asegurarZonaSubSteps = [
  { id: "balizas", label: "Encender balizas y luces de emergencia" },
  { id: "chaleco", label: "Colocarse el chaleco reflectante" },
  { id: "triangulos", label: "Colocar los triángulos de seguridad (a 50m)" },
  { id: "motores", label: "Apagar motores y cortar contacto de autos" },
  { id: "peligro", label: "Verificar que no haya derrames de combustible" },
];

export function ChecklistStep({ step, onNext, partyId }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { currentIncident, updateInvolvedParty, updateResponse } =
    useIncidentStore();

  const [activeItem, setActiveItem] = useState<ChecklistItem | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraSide, setCameraSide] = useState<"front" | "back" | null>(null);
  const [tempDniPhotos, setTempDniPhotos] = useState<{
    front?: string;
    back?: string;
  }>({});
  const [dniNumber, setDniNumber] = useState("");
  const [tempLicensePhotos, setTempLicensePhotos] = useState<{
    front?: string;
    back?: string;
  }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [asegurarZoneChecked, setAsegurarZoneChecked] = useState<
    Record<string, boolean>
  >({});

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
      setDniNumber(currentParty.dni || "");
    } else if (activeItem?.id === "licencia_img" && currentParty) {
      setTempLicensePhotos({
        front: currentParty.photos?.licenseFront,
        back: currentParty.photos?.licenseBack,
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
        dominio_patente: currentParty.plate || currentParty.photos?.plate,
        nombre_titular: currentParty.ownerName,
        conductor_nombre: currentParty.name
          ? `${currentParty.name} ${currentParty.surname}`
          : undefined,
        conductor_tel: currentParty.phone,
        conductor_email: currentParty.email,
        dni_photos: currentParty.photos?.dniFront || currentParty.dni,
        licencia_img:
          currentParty.photos?.licenseFront || currentParty.photos?.licenseBack,
        fotos_danos: currentParty.photos?.damage,
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

  const isItemCompleted = useCallback(
    (itemId: string, itemType: string) => {
      const isUnavailable = currentParty?.unavailableFields?.includes(itemId);
      if (isUnavailable) return true;

      if (currentParty) {
        if (itemId === "aseguradora") return !!currentParty.insuranceCompany;
        if (itemId === "poliza_num") return !!currentParty.policyNumber;
        if (itemId === "vigencia_seguro")
          return !!currentParty.insuranceValidity;
        if (itemId === "dominio_patente")
          return !!currentParty.plate || !!currentParty.photos?.plate;
        if (itemId === "nombre_titular") return !!currentParty.ownerName;
        if (itemId === "conductor_nombre") return !!currentParty.name;
        if (itemId === "dni_photos")
          return !!currentParty.dni || !!currentParty.photos?.dniFront;
        if (itemId === "licencia_img")
          return (
            !!currentParty.photos?.licenseFront ||
            !!currentParty.photos?.licenseBack
          );
        if (itemId === "conductor_tel") return !!currentParty.phone;
        if (itemId === "conductor_email") return !!currentParty.email;
        if (itemId === "fotos_danos")
          return (currentParty.photos?.damage?.length || 0) > 0;
      }

      const value = responses[itemId];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    },
    [responses, currentParty],
  );

  const allCompleted = useMemo(() => {
    const requiredItems = items.filter((i) => i.required);
    return requiredItems.every((item) => isItemCompleted(item.id, item.type));
  }, [items, isItemCompleted]);

  const handleItemPress = (item: ChecklistItem) => {
    if (item.type === "section") return;
    if (currentParty?.unavailableFields?.includes(item.id)) {
      handleToggleUnavailable(item.id);
      return;
    }

    // Toggle simple checks directly without opening a modal
    if (!partyId) {
      const isSimpleCheck =
        item.id === "no_mover_vehiculos" ||
        (item.type === "info" &&
          item.id !== "asegurar_zona" &&
          item.id !== "llamar_911" &&
          item.id !== "llamado_911");

      if (isSimpleCheck) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const currentValue = responses[item.id];
        const newValue = currentValue ? undefined : "Completado";
        updateResponse(step.id, {
          ...responses,
          [item.id]: newValue,
        });
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveItem(item);

    if (item.id === "dni_photos" && currentParty) {
      setDniNumber(currentParty.dni || "");
      setTempDniPhotos({
        front: currentParty.photos.dniFront || "",
        back: currentParty.photos.dniBack || "",
      });
    }

    // Initialize asegurarZoneChecked if opening asegurar_zona
    if (item.id === "asegurar_zona") {
      const isDone = responses["asegurar_zona"] === "Completado";
      const initialChecked: Record<string, boolean> = {};
      asegurarZonaSubSteps.forEach((sub) => {
        initialChecked[sub.id] = isDone;
      });
      setAsegurarZoneChecked(initialChecked);
    }

    const val = responses[item.id] || "";
    if (item.fields) {
      const initialForm: Record<string, string> = {};
      if (item.id === "conductor_nombre" && currentParty) {
        initialForm["nombre"] = currentParty.name || "";
        initialForm["apellido"] = currentParty.surname || "";
      } else {
        item.fields.forEach((f) => {
          initialForm[f.id] = String(responses[f.id] || "");
        });
      }
      setFormData(initialForm);
    } else {
      setFormData({ [item.id]: String(val) });
    }
    setIsPhotoMode(item.type === "photo" || isImageUri(responses[item.id]));
  };

  const handleSaveItem = (valueOverride?: string) => {
    if (!activeItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let finalValue = valueOverride;
    if (!finalValue) {
      if (activeItem.fields) {
        finalValue = activeItem.fields
          .map((f) => (formData[f.id] || "").trim())
          .filter(Boolean)
          .join(" ");
      } else {
        finalValue = (formData[activeItem.id] || "").trim() || "Completado";
      }
    } else {
      finalValue = finalValue.trim();
    }

    if (partyId) {
      const update: Partial<InvolvedParty> = {};
      const photosUpdate = { ...(currentParty?.photos || {}) };

      switch (activeItem.id) {
        case "conductor_nombre":
          update.name = formData["nombre"];
          update.surname = formData["apellido"];
          break;
        case "aseguradora":
          update.insuranceCompany = finalValue;
          break;
        case "poliza_num":
          update.policyNumber = finalValue;
          break;
        case "vigencia_seguro":
          update.insuranceValidity = finalValue;
          break;
        case "dominio_patente":
          update.plate = finalValue;
          photosUpdate.plate =
            finalValue && finalValue.startsWith("file://")
              ? finalValue
              : undefined;
          break;
        case "nombre_titular":
          update.ownerName = finalValue;
          break;
        case "conductor_tel":
          update.phone = finalValue;
          break;
        case "conductor_email":
          update.email = finalValue;
          break;
        case "licencia_img":
          photosUpdate.licenseFront = tempLicensePhotos.front;
          photosUpdate.licenseBack = tempLicensePhotos.back;
          break;
        case "dni_photos":
          photosUpdate.dniFront = tempDniPhotos.front;
          photosUpdate.dniBack = tempDniPhotos.back;
          update.dni = (dniNumber || "").trim();
          update.useDniPhoto = !!(tempDniPhotos.front || tempDniPhotos.back);
          break;
        case "fotos_danos":
          photosUpdate.damage = [...(photosUpdate.damage || []), finalValue!];
          break;
      }

      update.photos = photosUpdate;
      const newUnavailable = (currentParty?.unavailableFields || []).filter(
        (id) => id !== activeItem.id,
      );
      update.unavailableFields = newUnavailable;
      console.log("Updating party", partyId, "with", update);
      updateInvolvedParty(partyId, update);
    } else {
      // Save global step responses
      const newResponses = { ...responses };
      if (activeItem.id === "tomar_fotos") {
        if (valueOverride) {
          const currentPhotos = Array.isArray(responses["tomar_fotos"])
            ? responses["tomar_fotos"]
            : [];
          newResponses["tomar_fotos"] = [...currentPhotos, valueOverride];
        }
      } else {
        newResponses[activeItem.id] = finalValue;
      }
      updateResponse(step.id, newResponses);
    }

    const isPhotoGathering =
      activeItem.id === "fotos_danos" || activeItem.id === "tomar_fotos";
    if (!isPhotoGathering || !valueOverride) {
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
    }
  };

  const isSelected = (reason: string) =>
    currentParty?.missingDataReason?.startsWith(reason);

  const canSaveModalItem = () => {
    if (!activeItem) return false;
    if (!activeItem.required) return true;

    if (activeItem.id === "asegurar_zona") {
      return asegurarZonaSubSteps.every((sub) => asegurarZoneChecked[sub.id]);
    }
    if (activeItem.id === "dni_photos") {
      return !!dniNumber.trim() || !!tempDniPhotos.front;
    }
    if (activeItem.id === "licencia_img") {
      return !!tempLicensePhotos.front || !!tempLicensePhotos.back;
    }

    if (activeItem.id === "fotos_danos") {
      return (currentParty?.photos?.damage?.length || 0) > 0;
    }
    if (activeItem.id === "tomar_fotos") {
      return (responses["tomar_fotos"] || []).length > 0;
    }
    if (activeItem.fields) {
      return activeItem.fields.every((f) => !!(formData[f.id] || "").trim());
    }

    if (isPhotoMode) {
      const value = responses[activeItem.id] || formData[activeItem.id];
      return typeof value === "string" && value.startsWith("file://");
    }

    return !!(formData[activeItem.id] || "").trim();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (partyId && currentParty?.missingDataReason) {
      updateInvolvedParty(partyId, {
        missingDataReason: currentParty.missingDataReason.trim(),
      });
    }
    onNext(step.nextStep);
  };

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
            const value = responses[item.id];
            const isDone = isItemCompleted(item.id, item.type);

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
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 4,
                          backgroundColor: "transparent",
                        }}
                      >
                        {item.type === "camera" ||
                        item.type === "photo" ||
                        isImageUri(value) ? (
                          Array.isArray(value) ? (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                backgroundColor: "transparent",
                              }}
                            >
                              {value.slice(0, 3).map((uri, i) => (
                                <Image
                                  key={i}
                                  source={{ uri }}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 4,
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                  }}
                                />
                              ))}
                              {value.length > 3 && (
                                <Text
                                  style={[
                                    styles.itemValueText,
                                    { fontSize: 12, opacity: 0.6 },
                                  ]}
                                >
                                  +{value.length - 3} más
                                </Text>
                              )}
                              {value.length === 0 && (
                                <Text
                                  style={[
                                    styles.itemValueText,
                                    { color: "#F59E0B" },
                                  ]}
                                >
                                  Sin fotos aún
                                </Text>
                              )}
                            </View>
                          ) : (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                backgroundColor: "transparent",
                              }}
                            >
                              <Image
                                source={{ uri: value }}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 4,
                                  borderWidth: 1,
                                  borderColor: theme.border,
                                }}
                              />
                              <Text style={styles.itemValueText}>
                                {item.id === "dni_photos" && currentParty?.dni
                                  ? currentParty.dni
                                  : item.id === "dominio_patente" &&
                                      currentParty?.plate &&
                                      !currentParty.plate.startsWith("file://")
                                    ? currentParty.plate
                                    : "Foto capturada"}
                              </Text>
                            </View>
                          )
                        ) : (
                          <Text numberOfLines={1} style={styles.itemValueText}>
                            {value}
                          </Text>
                        )}
                      </View>
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
        onPress={handleNext}
        disabled={!allCompleted}
        style={[
          styles.nextButton,
          {
            backgroundColor: allCompleted ? theme.tint : theme.border,
            opacity: allCompleted ? 1 : 0.5,
          },
        ]}
      >
        <Text style={styles.nextButtonText}>
          {allCompleted
            ? partyId
              ? "Guardar cambios"
              : "Continuar"
            : "Faltan datos obligatorios"}
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
              {activeItem?.allowPhoto && (
                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 8,
                    gap: 12,
                    backgroundColor: "transparent",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsPhotoMode(false);
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: !isPhotoMode ? theme.tint : theme.border,
                      backgroundColor: !isPhotoMode
                        ? theme.tint + "15"
                        : theme.card,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: !isPhotoMode ? theme.tint : theme.text,
                      }}
                    >
                      Ingresar Texto
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsPhotoMode(true);
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: isPhotoMode ? theme.tint : theme.border,
                      backgroundColor: isPhotoMode
                        ? theme.tint + "15"
                        : theme.card,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: isPhotoMode ? theme.tint : theme.text,
                      }}
                    >
                      Tomar / Cargar Foto
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
                  {activeItem?.id === "asegurar_zona" ? (
                    <View style={{ gap: 16 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          opacity: 0.7,
                          lineHeight: 22,
                          color: theme.text,
                        }}
                      >
                        Completá estos pasos de seguridad para asegurar la zona
                        del accidente:
                      </Text>
                      <View style={{ gap: 10 }}>
                        {asegurarZonaSubSteps.map((sub) => {
                          const checked = asegurarZoneChecked[sub.id];
                          return (
                            <TouchableOpacity
                              key={sub.id}
                              onPress={() => {
                                Haptics.impactAsync(
                                  Haptics.ImpactFeedbackStyle.Light,
                                );
                                setAsegurarZoneChecked((prev) => ({
                                  ...prev,
                                  [sub.id]: !prev[sub.id],
                                }));
                              }}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                                padding: 14,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: checked ? "#10B981" : theme.border,
                                backgroundColor: checked
                                  ? "#10B98110"
                                  : theme.card,
                              }}
                            >
                              <View
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 12,
                                  borderWidth: 2,
                                  borderColor: checked
                                    ? "#10B981"
                                    : theme.border,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: checked
                                    ? "#10B981"
                                    : "transparent",
                                }}
                              >
                                {checked && <Check size={14} color="#fff" />}
                              </View>
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontWeight: "600",
                                  color: theme.text,
                                  flex: 1,
                                  opacity: checked ? 0.7 : 1,
                                  textDecorationLine: checked
                                    ? "line-through"
                                    : "none",
                                }}
                              >
                                {sub.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : activeItem?.id === "llamar_911" ||
                    activeItem?.id === "llamado_911" ? (
                    <View
                      style={{
                        gap: 20,
                        alignItems: "center",
                        paddingVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          opacity: 0.7,
                          textAlign: "center",
                          lineHeight: 22,
                          color: theme.text,
                        }}
                      >
                        Si hay personas heridas o peligro inminente, llamá
                        inmediatamente a emergencias.
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Heavy,
                          );
                          Linking.openURL("tel:911").catch(() => {
                            Alert.alert(
                              "Error",
                              "No se pudo realizar la llamada al 911.",
                            );
                          });
                        }}
                        style={{
                          backgroundColor: "#EF4444",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          paddingVertical: 20,
                          paddingHorizontal: 30,
                          borderRadius: 24,
                          width: "100%",
                        }}
                      >
                        <Phone size={24} color="#fff" />
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 20,
                            fontWeight: "900",
                            letterSpacing: 0.5,
                          }}
                        >
                          LLAMAR AL 911
                        </Text>
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 13,
                          opacity: 0.5,
                          fontStyle: "italic",
                          textAlign: "center",
                          color: theme.text,
                        }}
                      >
                        Al llamar, indicá tu ubicación exacta, cantidad de
                        heridos y estado general.
                      </Text>
                    </View>
                  ) : activeItem?.id === "tomar_fotos" ? (
                    <View style={{ gap: 16 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          opacity: 0.6,
                          fontStyle: "italic",
                          color: theme.text,
                        }}
                      >
                        Sacá fotos generales del accidente desde lejos para
                        mostrar la posición de los autos y el entorno.
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        {(responses["tomar_fotos"] || []).map(
                          (uri: string, idx: number) => (
                            <View
                              key={idx}
                              style={{
                                width: 100,
                                height: 100,
                                borderRadius: 12,
                                overflow: "hidden",
                                position: "relative",
                                borderWidth: 1,
                                borderColor: theme.border,
                              }}
                            >
                              <Image
                                source={{ uri }}
                                style={{ width: "100%", height: "100%" }}
                              />
                              <TouchableOpacity
                                onPress={() => {
                                  Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Medium,
                                  );
                                  const currentPhotos = Array.isArray(
                                    responses["tomar_fotos"],
                                  )
                                    ? responses["tomar_fotos"]
                                    : [];
                                  const newPhotos = currentPhotos.filter(
                                    (_, i) => i !== idx,
                                  );
                                  updateResponse(step.id, {
                                    ...responses,
                                    tomar_fotos: newPhotos,
                                  });
                                }}
                                style={{
                                  position: "absolute",
                                  top: 6,
                                  right: 6,
                                  backgroundColor: "rgba(0,0,0,0.6)",
                                  borderRadius: 12,
                                  padding: 4,
                                }}
                              >
                                <X size={14} color="white" />
                              </TouchableOpacity>
                            </View>
                          ),
                        )}
                        <TouchableOpacity
                          onPress={() => setShowCamera(true)}
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 12,
                            borderStyle: "dashed",
                            borderWidth: 2,
                            borderColor: theme.tint,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: theme.tint + "10",
                          }}
                        >
                          <CameraIcon size={32} color={theme.tint} />
                          <Text
                            style={{
                              fontSize: 10,
                              color: theme.tint,
                              marginTop: 4,
                              fontWeight: "bold",
                            }}
                          >
                            AÑADIR
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : activeItem?.id === "dni_photos" ? (
                    <View style={{ gap: 20 }}>
                      <View style={{ gap: 8 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "900",
                            opacity: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Número de DNI
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              backgroundColor: theme.card,
                              borderColor: theme.border,
                              minHeight: 60,
                              borderRadius: 16,
                              paddingHorizontal: 16,
                              fontSize: 18,
                              fontWeight: "600",
                            },
                          ]}
                          placeholder="Ej: 12.345.678"
                          placeholderTextColor={theme.tabIconDefault}
                          value={dniNumber}
                          onChangeText={setDniNumber}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "900",
                            opacity: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Fotos del documento
                        </Text>
                        <View style={{ flexDirection: "row", gap: 12 }}>
                          {(["front", "back"] as const).map((side) => (
                            <TouchableOpacity
                              key={side}
                              onPress={() => {
                                setCameraSide(side);
                                setShowCamera(true);
                              }}
                              style={{
                                flex: 1,
                                height: 120,
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor: tempDniPhotos[side]
                                  ? "#10B981"
                                  : theme.border,
                                borderStyle: tempDniPhotos[side]
                                  ? "solid"
                                  : "dashed",
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "hidden",
                                backgroundColor: theme.card,
                              }}
                            >
                              {tempDniPhotos[side] ? (
                                <Image
                                  source={{ uri: tempDniPhotos[side] }}
                                  style={{ width: "100%", height: "100%" }}
                                />
                              ) : (
                                <>
                                  <CameraIcon size={32} color={theme.tint} />
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      fontWeight: "bold",
                                      color: theme.tint,
                                      marginTop: 4,
                                    }}
                                  >
                                    {side === "front" ? "FRENTE" : "DORSO"}
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  ) : activeItem?.id === "licencia_img" ? (
                    <View style={{ gap: 20 }}>
                      <View style={{ gap: 8 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "900",
                            opacity: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Fotos de la Licencia
                        </Text>
                        <View style={{ flexDirection: "row", gap: 12 }}>
                          {(["front", "back"] as const).map((side) => (
                            <TouchableOpacity
                              key={side}
                              onPress={() => {
                                setCameraSide(side);
                                setShowCamera(true);
                              }}
                              style={{
                                flex: 1,
                                height: 120,
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor: tempLicensePhotos[side]
                                  ? "#10B981"
                                  : theme.border,
                                borderStyle: tempLicensePhotos[side]
                                  ? "solid"
                                  : "dashed",
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "hidden",
                                backgroundColor: theme.card,
                              }}
                            >
                              {tempLicensePhotos[side] ? (
                                <Image
                                  source={{ uri: tempLicensePhotos[side] }}
                                  style={{ width: "100%", height: "100%" }}
                                />
                              ) : (
                                <>
                                  <CameraIcon size={32} color={theme.tint} />
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      fontWeight: "bold",
                                      color: theme.tint,
                                      marginTop: 4,
                                    }}
                                  >
                                    {side === "front" ? "FRENTE" : "DORSO"}
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  ) : activeItem?.id === "fotos_danos" ? (
                    <View style={{ gap: 16 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        {currentParty?.photos?.damage?.map((uri, idx) => (
                          <View
                            key={idx}
                            style={{
                              width: 100,
                              height: 100,
                              borderRadius: 12,
                              overflow: "hidden",
                              position: "relative",
                              borderWidth: 1,
                              borderColor: theme.border,
                            }}
                          >
                            <Image
                              source={{ uri }}
                              style={{ width: "100%", height: "100%" }}
                            />
                            <TouchableOpacity
                              onPress={() => {
                                Haptics.impactAsync(
                                  Haptics.ImpactFeedbackStyle.Medium,
                                );
                                const newDamage = (
                                  currentParty.photos.damage || []
                                ).filter((_, i) => i !== idx);
                                updateInvolvedParty(partyId!, {
                                  photos: {
                                    ...currentParty.photos,
                                    damage: newDamage,
                                  },
                                });
                              }}
                              style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                backgroundColor: "rgba(0,0,0,0.6)",
                                borderRadius: 12,
                                padding: 4,
                              }}
                            >
                              <X size={14} color="white" />
                            </TouchableOpacity>
                          </View>
                        ))}
                        <TouchableOpacity
                          onPress={() => setShowCamera(true)}
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 12,
                            borderStyle: "dashed",
                            borderWidth: 2,
                            borderColor: theme.tint,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: theme.tint + "10",
                          }}
                        >
                          <CameraIcon size={32} color={theme.tint} />
                          <Text
                            style={{
                              fontSize: 10,
                              color: theme.tint,
                              marginTop: 4,
                              fontWeight: "bold",
                            }}
                          >
                            AÑADIR
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : !isPhotoMode ? (
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
                          setFormData({
                            ...formData,
                            [activeItem?.id || ""]: text,
                          })
                        }
                        autoFocus
                        autoCapitalize={
                          activeItem?.id === "dominio_patente"
                            ? "characters"
                            : "sentences"
                        }
                      />
                    )
                  ) : (
                    (() => {
                      const photoUri =
                        formData[activeItem?.id || ""] ||
                        responses[activeItem?.id || ""];
                      const hasPhoto =
                        typeof photoUri === "string" &&
                        photoUri.startsWith("file://");
                      if (hasPhoto) {
                        return (
                          <View style={{ alignItems: "center", gap: 16 }}>
                            <Image
                              source={{ uri: photoUri }}
                              style={{
                                width: "100%",
                                height: 200,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: theme.border,
                              }}
                              resizeMode="cover"
                            />
                            <TouchableOpacity
                              onPress={() => {
                                if (!activeItem) return;
                                Haptics.impactAsync(
                                  Haptics.ImpactFeedbackStyle.Medium,
                                );
                                if (partyId) {
                                  const update: Partial<InvolvedParty> = {};
                                  if (activeItem.id === "asegurar_zona") {
                                    // Should not happen, but clear it
                                  } else if (
                                    activeItem.id === "dominio_patente"
                                  ) {
                                    update.plate = undefined;
                                    if (currentParty) {
                                      update.photos = {
                                        ...currentParty.photos,
                                        plate: undefined,
                                      };
                                    }
                                  } else {
                                    if (activeItem.id === "aseguradora")
                                      update.insuranceCompany = undefined;
                                    if (activeItem.id === "poliza_num")
                                      update.policyNumber = undefined;
                                    if (activeItem.id === "vigencia_seguro")
                                      update.insuranceValidity = undefined;
                                    if (activeItem.id === "conductor_email")
                                      update.email = undefined;
                                  }
                                  updateInvolvedParty(partyId, update);
                                } else {
                                  updateResponse(step.id, {
                                    ...responses,
                                    [activeItem.id]: undefined,
                                  });
                                }
                                setFormData({
                                  ...formData,
                                  [activeItem.id]: "",
                                });
                              }}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: "#EF4444",
                                backgroundColor: "#EF444410",
                              }}
                            >
                              <X size={16} color="#EF4444" />
                              <Text
                                style={{ color: "#EF4444", fontWeight: "bold" }}
                              >
                                Eliminar Foto
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }
                      return (
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
                      );
                    })()
                  )}
                </View>
              )}

              <View style={{ gap: 12, marginTop: 10 }}>
                {activeItem?.required &&
                  activeItem?.id !== "fotos_danos" &&
                  activeItem?.id !== "licencia_img" &&
                  activeItem?.id !== "asegurar_zona" &&
                  activeItem?.id !== "llamar_911" &&
                  activeItem?.id !== "llamado_911" &&
                  activeItem?.id !== "tomar_fotos" && (
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

                {activeItem?.id === "asegurar_zona" ? (
                  (() => {
                    const allSubChecked = asegurarZonaSubSteps.every(
                      (sub) => asegurarZoneChecked[sub.id],
                    );
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          if (allSubChecked) {
                            handleSaveItem("Completado");
                          }
                        }}
                        disabled={!allSubChecked}
                        style={[
                          styles.saveButton,
                          {
                            backgroundColor: allSubChecked
                              ? "#10B981"
                              : theme.border,
                            opacity: allSubChecked ? 1 : 0.5,
                          },
                        ]}
                      >
                        <Check size={24} color="#fff" />
                        <Text style={styles.saveButtonText}>
                          YA ASEGURÉ LA ZONA
                        </Text>
                      </TouchableOpacity>
                    );
                  })()
                ) : activeItem?.id === "llamar_911" ||
                  activeItem?.id === "llamado_911" ? (
                  <TouchableOpacity
                    onPress={() => handleSaveItem("Completado")}
                    style={[styles.saveButton, { backgroundColor: "#10B981" }]}
                  >
                    <Check size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>
                      YA LLAMÉ / ya avisé
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      if (canSaveModalItem()) {
                        handleSaveItem();
                      }
                    }}
                    disabled={!canSaveModalItem()}
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor: canSaveModalItem()
                          ? theme.tint
                          : theme.border,
                        opacity: canSaveModalItem() ? 1 : 0.5,
                      },
                    ]}
                  >
                    <Check size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>
                      {activeItem?.id === "tomar_fotos"
                        ? "Finalizar Captura"
                        : "Guardar"}
                    </Text>
                  </TouchableOpacity>
                )}
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
          isDocument={
            activeItem?.id === "dni_photos" || activeItem?.id === "licencia_img"
          }
          onClose={() => {
            setShowCamera(false);
            setCameraSide(null);
          }}
          onCapture={(uri) => {
            if (activeItem?.id === "dni_photos") {
              const newPhotos = {
                ...tempDniPhotos,
                [cameraSide!]: uri,
              };
              setTempDniPhotos(newPhotos);
              updateInvolvedParty(partyId!, {
                photos: {
                  ...currentParty?.photos,
                  dniFront: newPhotos.front,
                  dniBack: newPhotos.back,
                },
              });
              setShowCamera(false);
            } else if (activeItem?.id === "licencia_img") {
              const newPhotos = {
                ...tempLicensePhotos,
                [cameraSide!]: uri,
              };
              setTempLicensePhotos(newPhotos);
              updateInvolvedParty(partyId!, {
                photos: {
                  ...currentParty?.photos,
                  licenseFront: newPhotos.front,
                  licenseBack: newPhotos.back,
                },
              });
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
