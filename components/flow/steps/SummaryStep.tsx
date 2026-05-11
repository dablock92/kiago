import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { CheckCircle, Home, Share2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Step } from '../../../engine/types';
import { useIncidentStore } from '../../../store/useIncidentStore';

interface Props {
  step: Step;
}

export function SummaryStep({ step }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { currentIncident, completeIncident } = useIncidentStore();

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    completeIncident();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <CheckCircle size={80} color="#10B981" />
      </View>
      
      <Text style={styles.title}>{step.text}</Text>
      <Text style={styles.subtitle}>{step.subtitle}</Text>

      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.summaryTitle}>Datos guardados:</Text>
        <ScrollView style={styles.responsesScroll}>
          {Object.entries(currentIncident?.responses || {}).map(([key, value]) => (
            <View key={key} style={styles.responseRow}>
              <Text style={styles.responseKey}>{key}:</Text>
              <Text style={styles.responseValue}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => alert('Compartiendo reporte...')}
          style={[styles.outlineButton, { borderColor: theme.border }]}
        >
          <Share2 size={20} color={theme.text} />
          <Text style={[styles.outlineButtonText, { color: theme.text }]}>Compartir Reporte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFinish}
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
        >
          <Home size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    marginVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginTop: 24,
    maxHeight: 300,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  responsesScroll: {
    flexGrow: 0,
  },
  responseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  responseKey: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: 'bold',
  },
  responseValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  primaryButton: {
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  outlineButton: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  outlineButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
