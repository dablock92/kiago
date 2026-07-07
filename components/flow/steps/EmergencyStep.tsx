import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { Info, Phone } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Option, Step } from "../../../engine/types";
import { useIncidentStore } from "../../../store/useIncidentStore";

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

/**
 * Step de emergencia: botones grandes de llamada (options con action "tel:...")
 * más una lista de indicaciones y botones de continuación.
 * El usuario está estresado: tap targets grandes y jerarquía clarísima.
 */
export function EmergencyStep({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const updateResponse = useIncidentStore((state) => state.updateResponse);

  const options = step.options || [];
  const callOptions = options.filter((o) => o.action?.startsWith("tel:"));
  const navOptions = options.filter((o) => !o.action);

  const handleCall = (option: Option) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Registramos la llamada en el reporte (queda en responses del incidente).
    updateResponse(step.id, option.label);
    Linking.openURL(option.action!);
  };

  const handleNav = (option?: Option) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext(option?.nextStep || step.nextStep);
  };

  const infoItems = (step.checklistItems || []).filter(
    (i): i is string => typeof i === "string",
  );

  return (
    <View style={styles.container}>
      <View style={styles.callSection}>
        {callOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleCall(option)}
            style={[
              styles.callButton,
              {
                backgroundColor:
                  option.style === "danger" ? "#EF4444" : theme.tint,
              },
            ]}
          >
            <Phone size={28} color="#fff" />
            <Text style={styles.callButtonText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {infoItems.length > 0 && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {infoItems.map((item, index) => (
            <View key={index} style={styles.infoRow}>
              <Info size={16} color={theme.tint} />
              <Text style={styles.infoText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.navSection}>
        {navOptions.length > 0 ? (
          navOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNav(option)}
              style={[styles.navButton, { borderColor: theme.border }]}
            >
              <Text style={styles.navButtonText}>{option.label}</Text>
            </TouchableOpacity>
          ))
        ) : step.nextStep ? (
          <TouchableOpacity
            onPress={() => handleNav()}
            style={[styles.navButton, { borderColor: theme.border }]}
          >
            <Text style={styles.navButtonText}>Continuar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  callSection: {
    gap: 16,
    marginTop: 8,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 28,
    borderRadius: 28,
  },
  callButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  infoCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "transparent",
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.8,
    lineHeight: 21,
  },
  navSection: {
    gap: 12,
    marginTop: "auto",
  },
  navButton: {
    padding: 22,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
