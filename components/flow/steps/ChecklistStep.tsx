import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Text, View } from '@/components/Themed';
import { Step } from '../../../engine/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

export function ChecklistStep({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const allChecked = step.checklistItems?.every((_, i) => checkedItems[i]);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{step.subtitle}</Text>
      <Text style={styles.title}>{step.text}</Text>

      <View style={styles.list}>
        {step.checklistItems?.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => toggleItem(index)}
            style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            {checkedItems[index] ? 
              <CheckCircle2 size={24} color={theme.tint} /> : 
              <Circle size={24} color={theme.tabIconDefault} />
            }
            <Text style={[styles.itemText, { opacity: checkedItems[index] ? 0.5 : 1 }]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onNext(step.nextStep);
        }}
        disabled={!allChecked}
        style={[
          styles.nextButton, 
          { 
            backgroundColor: allChecked ? theme.tint : theme.border,
            marginTop: 32 
          }
        ]}
      >
        <Text style={styles.nextButtonText}>Entendido, continuar</Text>
      </TouchableOpacity>
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
  list: {
    marginTop: 24,
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  nextButton: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
