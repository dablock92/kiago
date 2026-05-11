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
  ThumbsDown,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
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
  const { currentIncident, updateInvolvedParty } = useIncidentStore();

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
  const [tempPlatePhoto, setTempPlatePhoto] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    } else if (activeItem?.id === "dominio_patente" && currentParty) {
      setTempPlatePhoto(currentParty.photos?.plate || "");
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

    if (item.id === "dni_photos" && currentParty) {
      setDniNumber(currentParty.dni || "");
      setTempDniPhotos({
        front: currentParty.photos.dniFront || "",
        back: currentParty.photos.dniBack || "",
      });
    }

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
          .map((f) => (formData[f.id] || "").trim())
          .filter(Boolean)
          .join(" ");
      } else {
        finalValue = (formData[activeItem.id] || "").trim();
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
          photosUpdate.plate = tempPlatePhoto;
          break;
        case "nombre_titular":
          update.ownerName = finalValue;
          break;
        case "conductor_tel":
          update.phone = finalValue;
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
    }
  };

  const isSelected = (reason: string) =>
    currentParty?.missingDataReason?.startsWith(reason);

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
            const isDone =
              isUnavailable ||
              (item.id === "dni_photos" && currentParty
                ? !!currentParty.dni || !!currentParty.photos?.dniFront
                : item.id === "licencia_img" && currentParty
                  ? !!currentParty.photos?.licenseFront ||
                    !!currentParty.photos?.licenseBack
                  : item.id === "dominio_patente" && currentParty
                    ? !!currentParty.plate || !!currentParty.photos?.plate
                    : Array.isArray(value)
                      ? value.length > 0
                      : !!value);

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
                        {item.type === "camera" || item.type === "photo" ? (
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
                                      currentParty?.plate
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
          { backgroundColor: allCompleted ? theme.tint : theme.border },
        ]}
      >
        <Text style={styles.nextButtonText}>
          {partyId ? "Guardar cambios" : "Continuar"}
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
                  {activeItem?.id === "dni_photos" ? (
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
                  ) : activeItem?.id === "dominio_patente" ? (
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
                          Patente / Dominio
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
                              color: theme.text,
                            },
                          ]}
                          placeholder="Ej: ABC 123 o AF 123 JK"
                          placeholderTextColor={theme.tabIconDefault}
                          value={formData["dominio_patente"]}
                          onChangeText={(text) =>
                            setFormData({ ...formData, dominio_patente: text })
                          }
                          autoCapitalize="characters"
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
                          Foto del vehículo (opcional)
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowCamera(true)}
                          style={{
                            height: 140,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderColor: tempPlatePhoto
                              ? "#10B981"
                              : theme.border,
                            borderStyle: tempPlatePhoto ? "solid" : "dashed",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: theme.card,
                            overflow: "hidden",
                          }}
                        >
                          {tempPlatePhoto ? (
                            <Image
                              source={{ uri: tempPlatePhoto }}
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
                                TOMAR FOTO
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
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
                {activeItem?.required &&
                  activeItem?.id !== "fotos_danos" &&
                  activeItem?.id !== "licencia_img" && (
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
            } else if (activeItem?.id === "dominio_patente") {
              setTempPlatePhoto(uri);
              updateInvolvedParty(partyId!, {
                photos: {
                  ...currentParty?.photos,
                  plate: uri,
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
