import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Trash2 } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";

import { Text, View } from "@/components/Themed";
import { FlowRenderer } from "@/components/flow/FlowRenderer";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { flows } from "@/data/flows";
import { useIncidentStore } from "@/store/useIncidentStore";

export default function FlowScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { completeIncident } = useIncidentStore();

  // Buscamos el flujo de forma segura
  const flow = useMemo(() => {
    return (flows || []).find((f) => f.id === id) || flows[0];
  }, [id]);

  const [currentStepId, setCurrentStepId] = useState(flow?.steps[0]?.id || "");
  const [history, setHistory] = useState<string[]>([]);

  // Buscamos el paso actual de forma segura
  const currentStep = useMemo(() => {
    return flow?.steps.find((s) => s.id === currentStepId) || flow?.steps[0];
  }, [flow, currentStepId]);

  const handleNext = (nextId?: string) => {
    // Sentinel de fin de flow-guía: vuelve al inicio SIN generar reporte
    // (no todo problema genera un reporte — ver FABLE_BRIEF/ESTADO).
    if (nextId === "fin") {
      completeIncident();
      router.replace("/");
      return;
    }
    if (nextId) {
      setHistory((prev) => [...prev, currentStepId]);
      setCurrentStepId(nextId);
    } else {
      const currentIndex =
        flow?.steps.findIndex((s) => s.id === currentStepId) ?? -1;
      if (currentIndex < (flow?.steps.length ?? 0) - 1) {
        setHistory((prev) => [...prev, currentStepId]);
        setCurrentStepId(flow.steps[currentIndex + 1].id);
      }
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevId = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentStepId(prevId);
    } else {
      router.back();
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancelar reporte",
      "¿Estás seguro? Se borrarán todos los datos capturados hasta ahora.",
      [
        { text: "Continuar", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: () => {
            completeIncident(); // Limpia el store
            router.replace("/");
          },
        },
      ],
    );
  };

  if (!flow || !currentStep) {
    return (
      <View style={styles.errorContainer}>
        <Text>Cargando flujo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: flow.title,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={{ marginLeft: 0 }}>
              <ChevronLeft color={theme.text} size={28} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleCancel} style={{ marginRight: 0 }}>
              <Trash2 color="#EF4444" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlowRenderer step={currentStep} onNext={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
