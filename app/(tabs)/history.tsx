import { History, ExternalLink, FileText, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { getFlowTitle } from "@/data/flows";
import { getAllIncidents } from "@/services/databaseService";
import { Incident } from "@/store/useIncidentStore";

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);

  const loadIncidents = async () => {
    setRefreshing(true);
    const data = await getAllIncidents();
    setIncidents(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const renderItem = ({ item }: { item: Incident }) => {
    const date = new Date(item.createdAt).toLocaleDateString();
    const time = new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        onPress={() => setSelectedIncident(item)}
        style={[
          styles.item,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: theme.tint + "15",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileText size={24} color={theme.tint} />
        </View>
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
          <Text style={styles.itemTitle}>{getFlowTitle(item.flowId)}</Text>
          <Text style={styles.itemSubtitle}>
            {date} • {time}
          </Text>
        </View>
        <ExternalLink size={20} color={theme.text} opacity={0.3} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={incidents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={loadIncidents}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.empty}>
            <History size={48} color={theme.text} opacity={0.2} />
            <Text style={styles.emptyText}>No hay incidentes registrados</Text>
          </View>
        }
      />

      <Modal
        visible={!!selectedIncident}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del Reporte</Text>
              <TouchableOpacity onPress={() => setSelectedIncident(null)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }}>
              {selectedIncident && (
                <View style={styles.detailBody}>
                  <View
                    style={[
                      styles.detailCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={styles.detailLabel}>FECHA Y HORA</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedIncident.createdAt).toLocaleString()}
                    </Text>

                    <Text style={[styles.detailLabel, { marginTop: 16 }]}>
                      TIPO DE FLUJO
                    </Text>
                    <Text style={styles.detailValue}>
                      {selectedIncident.flowId}
                    </Text>
                  </View>

                  <Text style={styles.sectionTitle}>DATOS RECOPILADOS</Text>
                  {Object.entries(selectedIncident.responses).map(
                    ([key, value]) => (
                      <View
                        key={key}
                        style={[
                          styles.infoRow,
                          { borderBottomColor: theme.border },
                        ]}
                      >
                        <Text style={styles.infoLabel}>
                          {key.replace(/_/g, " ").toUpperCase()}
                        </Text>
                        <Text style={styles.infoValue}>
                          {typeof value === "string" ? value : "---"}
                        </Text>
                      </View>
                    ),
                  )}

                  {selectedIncident.involvedParties?.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>INVOLUCRADOS</Text>
                      {selectedIncident.involvedParties.map((party, idx) => (
                        <View
                          key={party.id}
                          style={[
                            styles.detailCard,
                            {
                              backgroundColor: theme.card,
                              borderColor: theme.border,
                              marginBottom: 12,
                            },
                          ]}
                        >
                          <Text style={styles.partyTitle}>
                            {selectedIncident.flowId === "choque"
                              ? `Tercero Involucrado #${idx + 1}`
                              : `Involucrado #${idx + 1}`}
                          </Text>
                          <View style={styles.partyGrid}>
                            <View style={styles.partyItem}>
                              <Text style={styles.partyLabel}>CONDUCTOR</Text>
                              <Text style={styles.partyValue}>
                                {party.name || "---"} {party.surname || ""}
                              </Text>
                            </View>
                            <View style={styles.partyItem}>
                              <Text style={styles.partyLabel}>PATENTE</Text>
                              <Text style={styles.partyValue}>
                                {party.plate || "---"}
                              </Text>
                            </View>
                            <View style={styles.partyItem}>
                              <Text style={styles.partyLabel}>COMPAÑÍA</Text>
                              <Text style={styles.partyValue}>
                                {party.insuranceCompany || "---"}
                              </Text>
                            </View>
                            <View style={styles.partyItem}>
                              <Text style={styles.partyLabel}>FOTOS</Text>
                              <Text style={styles.partyValue}>
                                {(party.photos?.damage?.length || 0) +
                                  (party.photos?.dniFront ? 1 : 0) +
                                  (party.photos?.dniBack ? 1 : 0) +
                                  (party.photos?.licenseFront ? 1 : 0) +
                                  (party.photos?.licenseBack ? 1 : 0) +
                                  (party.photos?.plate ? 1 : 0)}{" "}
                                capturadas
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 20, gap: 12 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
  },
  itemTitle: { fontSize: 16, fontWeight: "bold" },
  itemSubtitle: { fontSize: 13, opacity: 0.5, marginTop: 2 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    gap: 16,
  },
  emptyText: { fontSize: 16, opacity: 0.4, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "90%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: "900" },
  detailBody: { gap: 20 },
  detailCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  detailLabel: {
    fontSize: 11,
    fontWeight: "bold",
    opacity: 0.4,
    letterSpacing: 1,
  },
  detailValue: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    opacity: 0.3,
    letterSpacing: 2,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 12, fontWeight: "bold", opacity: 0.5, flex: 1 },
  infoValue: { fontSize: 12, fontWeight: "700", flex: 1, textAlign: "right" },
  partyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2563eb",
  },
  partyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  partyItem: { width: "45%" },
  partyLabel: { fontSize: 10, fontWeight: "bold", opacity: 0.4 },
  partyValue: { fontSize: 13, fontWeight: "700", marginTop: 2 },
});
