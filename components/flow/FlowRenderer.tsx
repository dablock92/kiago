import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { View } from '@/components/Themed';
import { Flow, Step } from '../../engine/types';
import { CameraStep } from './steps/CameraStep';
import { ChecklistStep } from './steps/ChecklistStep';
import { FormStep } from './steps/FormStep';
import { QuestionStep } from './steps/QuestionStep';
import { SummaryStep } from './steps/SummaryStep';

interface Props {
  flow: Flow;
}

export function FlowRenderer({ flow }: Props) {
  const [currentStepId, setCurrentStepId] = useState(flow.steps[0].id);

  const currentStep = useMemo(() => 
    flow.steps.find(s => s.id === currentStepId), 
  [flow.steps, currentStepId]);

  const handleNext = (nextStepId?: string) => {
    if (nextStepId) {
      setCurrentStepId(nextStepId);
    }
  };

  if (!currentStep) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        key={currentStep.id}
        entering={FadeInRight.duration(400)}
        exiting={FadeOutLeft.duration(400)}
        style={styles.stepWrapper}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderStep(currentStep, handleNext)}
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
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
});
