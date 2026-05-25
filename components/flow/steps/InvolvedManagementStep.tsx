import * as Haptics from "expo-haptics";
// REFRESH METRO 1
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  Plus,
  User,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
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
import { ChecklistStep } from "./ChecklistStep";

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

export function InvolvedManagementStep({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { currentIncident, addInvolvedParty } = useIncidentStore();
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);

  const parties = currentIncident?.involvedParties || [];
  const selectedIndex = parties.findIndex((p) => p.id === selectedPartyId);

  const handleAddParty = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newId = addInvolvedParty();
    setSelectedPartyId(newId);
  };

  const handleSelectParty = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPartyId(id);
  };

  const getPartyStatus = (party: InvolvedParty) => {
    const requiredItems =
      (step.checklistItems?.filter(
        (i) => typeof i !== "string" && i.required,
      ) as ChecklistItem[]) || [];

    const unavailableFields = party.unavailableFields || [];
    const hasAnyData = !!(
      party.name ||
      party.surname ||
      party.phone ||
      party.email ||
      party.dni ||
      party.policyNumber ||
      party.plate ||
      party.insuranceCompany ||
      party.insuranceValidity ||
      party.ownerName ||
      (party.photos.damage?.length || 0) > 0 ||
      party.photos.dniFront ||
      party.photos.dniBack ||
      party.photos.licenseFront ||
      party.photos.licenseBack ||
      party.photos.plate
    );

    if (!hasAnyData) return "empty";

    const allRequiredCovered = requiredItems.every((item) => {
      const isUnavailable = unavailableFields.includes(item.id);
      if (isUnavailable) return true;

      if (item.id === "aseguradora") return !!party.insuranceCompany;
      if (item.id === "poliza_num") return !!party.policyNumber;
      if (item.id === "vigencia_seguro") return !!party.insuranceValidity;
      if (item.id === "dominio_patente")
        return !!party.plate || !!party.photos.plate;
      if (item.id === "nombre_titular") return !!party.ownerName;
      if (item.id === "conductor_nombre")
        return !!party.name && !!party.surname;
      if (item.id === "dni_photos")
        return !!party.dni || !!party.photos.dniFront;
      if (item.id === "licencia_img")
        return !!party.photos.licenseFront || !!party.photos.licenseBack;
      if (item.id === "fotos_danos")
        return (party.photos.damage?.length || 0) > 0;
      return false;
    });

    if (allRequiredCovered) {
      return unavailableFields.length > 0 ? "partial" : "complete";
    }

    return "in_progress";
  };

  const isOnlyTwo =
    currentIncident?.responses["cantidad_vehiculos"] === "Solo 2 (yo y otro)";

  const allPartiesComplete =
    parties.length > 0 &&
    parties.every((p) => {
      const status = getPartyStatus(p);
      return status === "complete" || status === "partial";
    });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {parties.map((party, index) => {
            const status = getPartyStatus(party);
            const isComplete = status === "complete";
            const isPartial = status === "partial";
            const isEmpty = status === "empty";

            const borderColor = isComplete
              ? "#10B981"
              : isEmpty
                ? "#8B5CF6"
                : "#F59E0B"; // In progress or Partial

            return (
              <TouchableOpacity
                key={party.id}
                onPress={() => handleSelectParty(party.id)}
                style={[
                  styles.partyCard,
                  {
                    backgroundColor: "transparent",
                    borderColor: borderColor,
                    borderStyle: isEmpty ? "dashed" : "solid",
                    opacity: 1,
                  },
                ]}
              >
                <View style={styles.partyInfo}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: isComplete
                          ? "#10B98120"
                          : isEmpty
                            ? "#8B5CF620"
                            : "#F59E0B20",
                      },
                    ]}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={24} color="#10B981" />
                    ) : isEmpty ? (
                      <User size={24} color="#8B5CF6" />
                    ) : (
                      <AlertCircle size={24} color="#F59E0B" />
                    )}
                  </View>
                  <View style={styles.details}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "transparent",
                      }}
                    >
                      <Text style={styles.partyTitle}>
                        {isOnlyTwo
                          ? "Involucrado"
                          : `Involucrado #${index + 1}`}
                      </Text>
                      {isPartial && (
                        <View
                          style={{
                            backgroundColor: "#F59E0B20",
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 8,
                              color: "#F59E0B",
                              fontWeight: "bold",
                            }}
                          >
                            FALTAN ALGUNOS DATOS
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.partyName} numberOfLines={1}>
                      {party.useDniPhoto
                        ? "Identidad por foto 📸"
                        : party.name
                          ? `${party.name} ${party.surname}`
                          : isEmpty
                            ? "Sin completar"
                            : "Sin nombre ni foto DNI"}
                    </Text>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: theme.border },
                        ]}
                      >
                        <Camera size={12} color={theme.text} opacity={0.6} />
                        <Text style={styles.badgeText}>
                          {(party.photos.damage?.length || 0) +
                            (party.photos.dniFront ? 1 : 0) +
                            (party.photos.dniBack ? 1 : 0) +
                            (party.photos.licenseFront ? 1 : 0) +
                            (party.photos.licenseBack ? 1 : 0)}{" "}
                          fotos
                        </Text>
                      </View>
                      {(party.policyNumber ||
                        party.unavailableFields?.includes("poliza_num")) && (
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: party.policyNumber
                                ? "#10B98120"
                                : "#F59E0B20",
                            },
                          ]}
                        >
                          <FileText
                            size={12}
                            color={party.policyNumber ? "#10B981" : "#F59E0B"}
                          />
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color: party.policyNumber
                                  ? "#10B981"
                                  : "#F59E0B",
                              },
                            ]}
                          >
                            {party.policyNumber ? "Póliza" : "Póliza s/d"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.tabIconDefault} />
              </TouchableOpacity>
            );
          })}

          {!(isOnlyTwo && parties.length >= 1) && (
            <TouchableOpacity
              onPress={handleAddParty}
              style={[styles.addButton, { borderColor: theme.tint }]}
            >
              <Plus size={24} color={theme.tint} />
              <Text style={[styles.addButtonText, { color: theme.tint }]}>
                {parties.length === 0
                  ? "Cargar involucrado"
                  : "Agregar otro involucrado"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => onNext(step.nextStep)}
        disabled={!allPartiesComplete}
        style={[
          styles.nextButton,
          {
            backgroundColor: allPartiesComplete ? theme.tint : theme.border,
            opacity: allPartiesComplete ? 1 : 0.5,
          },
        ]}
      >
        <Text style={styles.nextButtonText}>
          {allPartiesComplete
            ? "Finalizar Intercambio"
            : "Faltan datos obligatorios"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={!!selectedPartyId}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[styles.modalContainer, { backgroundColor: theme.background }]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isOnlyTwo
                ? "Datos del involucrado"
                : `Datos del involucrado: ${selectedIndex + 1}`}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedPartyId(null)}
              style={styles.closeButton}
            >
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <ChecklistStep
              partyId={selectedPartyId || undefined}
              step={{
                ...step,
                id: `party-${selectedPartyId}`,
                text: "Relevamiento de Datos",
                subtitle: isOnlyTwo
                  ? "Datos del involucrado"
                  : `Involucrado #${selectedIndex + 1}`,
              }}
              onNext={() => setSelectedPartyId(null)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  list: {
    gap: 16,
    paddingBottom: 20,
  },
  partyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    minHeight: 100,
  },
  partyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    gap: 2,
  },
  partyTitle: {
    fontSize: 11,
    opacity: 0.5,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  partyName: {
    fontSize: 18,
    fontWeight: "900",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    gap: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nextButton: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 20,
    marginBottom: Platform.OS === "ios" ? 0 : 20,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#00000010",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    padding: 8,
  },
});
