import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Car,
  CreditCard,
  Dog,
  Flame,
  Plane,
  ShieldAlert,
  Smartphone,
  Stethoscope,
  UserMinus
} from 'lucide-react-native';
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useIncidentStore } from '../../store/useIncidentStore';

const { width } = Dimensions.get('window');

const SCENARIOS = [
  { id: 'choque', title: 'Choqué', icon: Car, color: '#EF4444' },
  { id: 'robo_celular', title: 'Me robaron el celular', icon: Smartphone, color: '#F59E0B' },
  { id: 'robo_tarjetas', title: 'Me robaron tarjetas', icon: CreditCard, color: '#3B82F6' },
  { id: 'policia', title: 'Me frenó la policía', icon: ShieldAlert, color: '#6366F1' },
  { id: 'emergencia', title: 'Emergencia médica', icon: Stethoscope, color: '#10B981' },
  { id: 'incendio', title: 'Incendio / Gas', icon: Flame, color: '#EF4444' },
  { id: 'perdi_alguien', title: 'Perdí a alguien', icon: UserMinus, color: '#EC4899' },
  { id: 'perdi_mascota', title: 'Perdí mi mascota', icon: Dog, color: '#8B5CF6' },
  { id: 'problema_viaje', title: 'Problema viajando', icon: Plane, color: '#3B82F6' },
  { id: 'inseguro', title: 'Me siento inseguro', icon: AlertTriangle, color: '#F59E0B' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const startIncident = useIncidentStore((state) => state.startIncident);

  const handleScenarioPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    startIncident(id);
    router.push(`/flow/${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Relajá. No hay tal crisis.</Text>
        <Text style={styles.title}>¿Qué pasó?</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {SCENARIOS.map((scenario) => (
            <Pressable
              key={scenario.id}
              onPress={() => handleScenarioPress(scenario.id)}
              style={({ pressed }) => [
                styles.card,
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${scenario.color}15` }]}>
                <scenario.icon size={32} color={scenario.color} />
              </View>
              <Text style={styles.cardTitle}>{scenario.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    opacity: 0.6,
    fontWeight: '500',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    width: (width - 48) / 2,
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
});
