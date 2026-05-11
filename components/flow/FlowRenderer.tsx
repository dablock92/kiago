import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { Text, View } from '@/components/Themed';
import { Step } from '../../engine/types';
import { CameraStep } from './steps/CameraStep';
import { ChecklistStep } from './steps/ChecklistStep';
import { FormStep } from './steps/FormStep';
import { QuestionStep } from './steps/QuestionStep';
import { SummaryStep } from './steps/SummaryStep';
import { InvolvedManagementStep } from './steps/InvolvedManagementStep';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

export function FlowRenderer({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Si no hay step, no renderizamos nada para evitar crashes
  if (!step) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.fixedHeader, { borderBottomColor: theme.border }]}>
        <Text style={styles.subtitle}>{step.subtitle || 'Paso'}</Text>
        <Text style={styles.title}>{step.text || 'Cargando...'}</Text>
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
    case 'question':
      return <QuestionStep step={step} onNext={onNext} />;
    case 'checklist':
      return <ChecklistStep step={step} onNext={onNext} />;
    case 'camera':
      return <CameraStep step={step} onNext={onNext} />;
    case 'form':
      return <FormStep step={step} onNext={onNext} />;
    case 'summary':
      return <SummaryStep step={step} />;
    case 'involved_management':
      return <InvolvedManagementStep step={step} onNext={onNext} />;
    default:
      return (
        <View style={{ padding: 20 }}>
          <Text>Tipo de paso no soportado: {step.type}</Text>
        </View>
      );
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
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
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
});
