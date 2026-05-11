import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Step } from "../../../engine/types";
import { useIncidentStore } from "../../../store/useIncidentStore";

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

export function FormStep({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const updateResponse = useIncidentStore((state) => state.updateResponse);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const trimmedData = Object.keys(formData).reduce(
      (acc, key) => {
        acc[key] = (formData[key] || "").trim();
        return acc;
      },
      {} as Record<string, string>,
    );
    updateResponse(step.id, trimmedData);
    onNext(step.nextStep);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.form}>
        {step.fields?.map((field) => (
          <View key={field.id} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder={field.placeholder}
              placeholderTextColor={theme.tabIconDefault}
              keyboardType={field.type === "phone" ? "phone-pad" : "default"}
              value={formData[field.id]}
              onChangeText={(text) =>
                setFormData({ ...formData, [field.id]: text })
              }
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleNext}
        style={[
          styles.nextButton,
          { backgroundColor: theme.tint, marginTop: 32 },
        ]}
      >
        <Text style={styles.nextButtonText}>Continuar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  form: {
    marginTop: 24,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.7,
  },
  input: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 18,
  },
  nextButton: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
