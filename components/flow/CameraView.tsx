import { CameraView as ExpoCamera, useCameraPermissions } from "expo-camera";
import { RotateCcw, X, Zap, ZapOff } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { View as RNView, StyleSheet, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

interface Props {
  onCapture: (uri: string) => void;
  onClose: () => void;
  isDocument?: boolean;
}

export function CameraView({ onCapture, onClose, isDocument = false }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<"on" | "off">("off");
  const [facing, setFacing] = useState<"back" | "front">("back");
  const cameraRef = useRef<ExpoCamera>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Cargando cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Necesitamos acceso a la cámara para capturar las fotos.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={[styles.button, { backgroundColor: theme.tint }]}
        >
          <Text style={styles.buttonText}>Dar permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={32} color={theme.text} />
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });
      if (photo) {
        onCapture(photo.uri);
      }
    }
  };

  return (
    <RNView style={styles.container}>
      <ExpoCamera
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={flash === "on"}
      />
      <RNView style={styles.overlay}>
        {/* Header */}
        <RNView style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFlash(flash === "on" ? "off" : "on")}
          >
            {flash === "on" ? (
              <Zap size={28} color="#FFD700" />
            ) : (
              <ZapOff size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </RNView>

        {/* Guide Frame */}
        {isDocument && (
          <RNView style={styles.guideContainer}>
            <RNView style={styles.guideFrame} />
            <Text style={styles.guideText}>
              Ubicar documento dentro del cuadro
            </Text>
          </RNView>
        )}

        {/* Footer Controls */}
        <RNView style={styles.footer}>
          <TouchableOpacity
            onPress={() => setFacing(facing === "back" ? "front" : "back")}
            style={styles.sideButton}
          >
            <RotateCcw size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
            <RNView style={styles.captureInner} />
          </TouchableOpacity>

          <RNView style={styles.sideButton} />
        </RNView>
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guideContainer: {
    alignItems: "center",
    gap: 20,
  },
  guideFrame: {
    width: "90%",
    aspectRatio: 1.6, // Proporción de un documento tipo tarjeta
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 20,
    borderStyle: "dashed",
  },
  guideText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },
  sideButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 30,
  },
});
