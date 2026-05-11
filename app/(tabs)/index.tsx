import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Rocket, Shield, Sparkles, Zap } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.background, theme.card]}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.View 
        entering={FadeInUp.delay(200).duration(1000)}
        style={styles.header}
      >
        <View style={styles.iconContainer}>
          <Sparkles size={48} color={theme.tint} />
        </View>
        <Text style={styles.title}>Kiago Premium</Text>
        <Text style={styles.subtitle}>Tu plataforma base lista para escalar</Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(400).duration(1000)}
        style={styles.grid}
      >
        <FeatureCard 
          icon={<Rocket size={24} color={theme.tint} />}
          title="Rápido"
          desc="Optimizado con Expo"
        />
        <FeatureCard 
          icon={<Zap size={24} color={theme.tint} />}
          title="Moderno"
          desc="React Native 0.81"
        />
        <FeatureCard 
          icon={<Shield size={24} color={theme.tint} />}
          title="Seguro"
          desc="Estructura sólida"
        />
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(600).duration(1000)}
        style={styles.footer}
      >
        <Pressable 
          onPress={handlePress}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <Text style={styles.buttonText}>Comenzar ahora</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {icon}
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 48,
  },
  card: {
    width: (width - 64) / 2,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cardDesc: {
    fontSize: 12,
    opacity: 0.5,
  },
  footer: {
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 50,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
