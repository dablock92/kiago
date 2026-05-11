import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { AlertTriangle, Hammer, Construction } from "lucide-react-native";

import { Text, View } from "@/components/Themed";
import { Step } from "../../engine/types";
import { CameraStep } from "./steps/CameraStep";
import { ChecklistStep } from "./steps/ChecklistStep";
import { FormStep } from "./steps/FormStep";
import { QuestionStep } from "./steps/QuestionStep";
import { SummaryStep } from "./steps/SummaryStep";
import { InvolvedManagementStep } from "./steps/InvolvedManagementStep";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

export function FlowRenderer({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  if (!step) return null;

  // Si es modo construcción, usamos un layout centrado
  if (step.type === "construction") {
    return (
      <View style={styles.constructionContainer}>
        <Animated.View
          entering={FadeInRight.duration(500)}
          style={styles.constructionContent}
        >
          <View
            style={[styles.iconCircle, { backgroundColor: theme.tint + "15" }]}
          >
            <Construction size={48} color={theme.tint} />
          </View>
          <Text style={styles.constructionTitle}>{step.text}</Text>
          <Text style={styles.constructionSubtitle}>
            {step.subtitle || "Esta sección todavía no se encuentra disponible"}
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.fixedHeader, { borderBottomColor: theme.border }]}>
        <Text style={styles.subtitle}>{step.subtitle || "Paso"}</Text>
        <Text style={styles.title}>{step.text || "Cargando..."}</Text>
      </View>

      <Animated.View
        key={step.id}
        entering={FadeInRight.duration(400)}
        exiting={FadeOutLeft.duration(400)}
        style={styles.stepWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStep(step, onNext)}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function renderStep(step: Step, onNext: (nextId?: string) => void) {
  switch (step.type) {
    case "question":
      return <QuestionStep step={step} onNext={onNext} />;
    case "checklist":
      return <ChecklistStep step={step} onNext={onNext} />;
    case "camera":
      return <CameraStep step={step} onNext={onNext} />;
    case "form":
      return <FormStep step={step} onNext={onNext} />;
    case "summary":
      return <SummaryStep step={step} />;
    case "involved_management":
      return <InvolvedManagementStep step={step} onNext={onNext} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    gap: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  stepWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    paddingBottom: 100,
  },
  // Estilos de Construcción
  constructionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  constructionContent: {
    alignItems: "center",
    gap: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  constructionTitle: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  constructionSubtitle: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: "center",
    lineHeight: 24,
  },
});
