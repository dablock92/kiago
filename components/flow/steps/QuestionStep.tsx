import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Text, View } from '@/components/Themed';
import { Step } from '../../../engine/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useIncidentStore } from '../../../store/useIncidentStore';

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

export function QuestionStep({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const updateResponse = useIncidentStore((state) => state.updateResponse);

  const handleOptionPress = (option: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateResponse(step.id, option.label);
    
    if (option.action === 'CALL_107') {
      // Mock emergency call
      alert('Llamando al 107...');
    }
    
    onNext(option.nextStep);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{step.subtitle}</Text>
      <Text style={styles.title}>{step.text}</Text>

      <View style={styles.options}>
        {step.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleOptionPress(option)}
            style={[
              styles.button,
              { 
                backgroundColor: option.style === 'danger' ? '#EF4444' : theme.card,
                borderColor: theme.border
              }
            ]}
          >
            <Text style={[
              styles.buttonText, 
              { color: option.style === 'danger' ? '#fff' : theme.text }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
  },
  options: {
    marginTop: 32,
    gap: 16,
  },
  button: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
