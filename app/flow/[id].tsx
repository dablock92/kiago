import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FlowRenderer } from '../../components/flow/FlowRenderer';
import { choqueFlow } from '../../data/flows/choque';
import { useIncidentStore } from '../../store/useIncidentStore';

export default function FlowScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const currentIncident = useIncidentStore((state) => state.currentIncident);
  const clearCurrent = useIncidentStore((state) => state.clearCurrent);

  // For now, only choqueFlow is supported
  const flow = useMemo(() => {
    if (id === 'choque') return choqueFlow;
    return null;
  }, [id]);

  const handleClose = () => {
    clearCurrent();
    router.replace('/');
  };

  if (!flow || !currentIncident) {
    return (
      <View style={styles.errorContainer}>
        <Text>Flujo no encontrado o sesión expirada.</Text>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={{ color: theme.tint, marginTop: 20 }}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{flow.title}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <FlowRenderer flow={flow} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
