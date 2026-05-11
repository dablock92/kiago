import { ChevronRight, Globe, Languages, MapPin } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useConfigStore } from '../../store/useConfigStore';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { country, province, language } = useConfigStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Configurá tu contexto para recibir la mejor asistencia.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.tint }]}>Localización</Text>
        
        <SettingItem 
          icon={<Globe size={20} color={theme.text} />}
          label="País"
          value={country}
          disabled={true}
        />
        
        <SettingItem 
          icon={<MapPin size={20} color={theme.text} />}
          label="Provincia / Estado"
          value={province}
          disabled={true}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.tint }]}>Preferencia</Text>
        
        <SettingItem 
          icon={<Languages size={20} color={theme.text} />}
          label="Idioma"
          value={language}
          disabled={true}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Modo Crisis v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function SettingItem({ icon, label, value, disabled }: { icon: React.ReactNode, label: string, value: string, disabled: boolean }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.item,
        { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: disabled ? 0.6 : (pressed ? 0.8 : 1)
        }
      ]}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
          {icon}
        </View>
        <View style={{ backgroundColor: 'transparent' }}>
          <Text style={styles.itemLabel}>{label}</Text>
          <Text style={styles.itemValue}>{value}</Text>
        </View>
      </View>
      {!disabled && <ChevronRight size={20} color={theme.tabIconDefault} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'transparent',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 14,
    opacity: 0.5,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 40,
  },
  version: {
    fontSize: 12,
    opacity: 0.3,
  },
});
