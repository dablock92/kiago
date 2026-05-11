import * as Haptics from 'expo-haptics';
import { Camera as CameraIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Step } from '../../../engine/types';

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

export function CameraStep({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [photos, setPhotos] = useState<string[]>([]);

  const handleTakePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Mock photo taking
    setPhotos([...photos, 'placeholder']);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{step.subtitle}</Text>
      <Text style={styles.title}>{step.text}</Text>

      <View style={styles.cameraPlaceholder}>
        {photos.length > 0 ? (
          <View style={styles.photoGrid}>
             {photos.map((_, i) => (
               <View key={i} style={[styles.photoThumb, { backgroundColor: theme.border }]} />
             ))}
          </View>
        ) : (
          <TouchableOpacity 
            onPress={handleTakePhoto}
            style={[styles.cameraButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <CameraIcon size={48} color={theme.tint} />
            <Text style={styles.cameraLabel}>Tocar para sacar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => onNext(step.nextStep)}
        disabled={step.required && photos.length === 0}
        style={[
          styles.nextButton, 
          { 
            backgroundColor: (step.required && photos.length === 0) ? theme.border : theme.tint,
            marginTop: 32 
          }
        ]}
      >
        <Text style={styles.nextButtonText}>Continuar</Text>
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
  cameraPlaceholder: {
    marginTop: 32,
    height: 300,
    borderRadius: 32,
    overflow: 'hidden',
  },
  cameraButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 16,
  },
  cameraLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
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
