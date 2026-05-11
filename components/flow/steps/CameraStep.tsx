import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Camera as CameraIcon, X, Check, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { Text, View } from "@/components/Themed";
import { Step } from "../../../engine/types";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useIncidentStore } from "../../../store/useIncidentStore";
import { CameraView } from "../CameraView";

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48 - 12) / 2;

export function CameraStep({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const updateResponse = useIncidentStore((state) => state.updateResponse);
  const currentIncident = useIncidentStore((state) => state.currentIncident);

  const [showCamera, setShowCamera] = useState(false);

  // Get current photos from store
  const photos: string[] = currentIncident?.responses[step.id] || [];

  const handleCapture = (uri: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateResponse(step.id, [...photos, uri]);
    setShowCamera(false);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    updateResponse(step.id, newPhotos);
  };

  if (showCamera) {
    return (
      <CameraView
        onCapture={handleCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.grid}>
          {photos.map((uri, i) => (
            <View key={i} style={styles.photoContainer}>
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity
                onPress={() => removePhoto(i)}
                style={styles.removeButton}
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => setShowCamera(true)}
            style={[
              styles.addButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Plus size={32} color={theme.tint} />
            <Text style={styles.addLabel}>Agregar Foto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => onNext(step.nextStep)}
        disabled={photos.length === 0}
        style={[
          styles.nextButton,
          { backgroundColor: photos.length > 0 ? theme.tint : theme.border },
        ]}
      >
        <Check size={24} color="#fff" />
        <Text style={styles.nextButtonText}>Finalizar Registro</Text>
      </TouchableOpacity>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 20,
  },
  photoContainer: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    borderRadius: 20,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 4,
  },
  addButton: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addLabel: {
    fontSize: 14,
    fontWeight: "bold",
    opacity: 0.5,
  },
  nextButton: {
    padding: 24,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
