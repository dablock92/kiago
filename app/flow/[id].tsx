import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { FlowRenderer } from '@/components/flow/FlowRenderer';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { flows } from '@/data/flows/choque';

export default function FlowScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Buscamos el flujo de forma segura
  const flow = useMemo(() => {
    return (flows || []).find(f => f.id === id) || flows[0];
  }, [id]);

  const [currentStepId, setCurrentStepId] = useState(flow?.steps[0]?.id || '');
  const [history, setHistory] = useState<string[]>([]);

  // Buscamos el paso actual de forma segura
  const currentStep = useMemo(() => {
    return flow?.steps.find(s => s.id === currentStepId) || flow?.steps[0];
  }, [flow, currentStepId]);

  const handleNext = (nextId?: string) => {
    if (nextId) {
      setHistory(prev => [...prev, currentStepId]);
      setCurrentStepId(nextId);
    } else {
      const currentIndex = flow?.steps.findIndex(s => s.id === currentStepId) ?? -1;
      if (currentIndex < (flow?.steps.length ?? 0) - 1) {
        setHistory(prev => [...prev, currentStepId]);
        setCurrentStepId(flow.steps[currentIndex + 1].id);
      }
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentStepId(prevId);
    } else {
      router.back();
    }
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
        }} 
      />
      
      <FlowRenderer 
        step={currentStep} 
        onNext={handleNext} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
