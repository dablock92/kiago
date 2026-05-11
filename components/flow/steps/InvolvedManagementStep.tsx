import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { Plus, User, ChevronRight, CheckCircle2, Circle, X, Camera, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Text, View } from '@/components/Themed';
import { Step } from '../../../engine/types';
import { InvolvedParty, useIncidentStore } from '../../../store/useIncidentStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChecklistStep } from './ChecklistStep';

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
}

export function InvolvedManagementStep({ step, onNext }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { currentIncident, addInvolvedParty } = useIncidentStore();
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);

  const parties = currentIncident?.involvedParties || [];
  const selectedIndex = parties.findIndex(p => p.id === selectedPartyId);

  const handleAddParty = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newId = addInvolvedParty();
    setSelectedPartyId(newId);
  };

  const handleSelectParty = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPartyId(id);
  };

  const getPartyStatus = (party: InvolvedParty) => {
    const photoCount = Object.values(party.photos).filter(p => !!p).length;
    
    // Nueva lógica: si usa foto, el nombre es válido pero necesita las 2 fotos de DNI extras
    const hasBasicInfo = !!(party.name && party.policyNumber);
    const hasRequiredPhotos = party.useDniPhoto 
      ? !!(party.photos.dniFront && party.photos.dniBack)
      : true;
      
    const isComplete = hasBasicInfo && hasRequiredPhotos && photoCount >= 3; // Seg, Lic, Cédula + DNI si aplica
    return { photoCount, hasBasicInfo, isComplete };
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {parties.map((party, index) => {
            const { photoCount, isComplete } = getPartyStatus(party);
            return (
              <TouchableOpacity
                key={party.id}
                onPress={() => handleSelectParty(party.id)}
                style={[
                  styles.partyCard, 
                  { 
                    backgroundColor: 'transparent', 
                    borderColor: isComplete ? '#10B981' : theme.border 
                  }
                ]}
              >
                <View style={styles.partyInfo}>
                  <View style={[
                    styles.avatar, 
                    { backgroundColor: isComplete ? '#10B98120' : theme.tint + '20' }
                  ]}>
                    {isComplete ? (
                      <CheckCircle2 size={24} color="#10B981" />
                    ) : (
                      <User size={24} color={theme.tint} />
                    )}
                  </View>
                  <View style={styles.details}>
                    <Text style={styles.partyTitle}>Involucrado #{index + 1}</Text>
                    <Text style={styles.partyName} numberOfLines={1}>
                      {party.name ? `${party.name} ${party.surname}` : 'Pendiente de datos'}
                    </Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, { backgroundColor: theme.border }]}>
                        <Camera size={12} color={theme.text} opacity={0.6} />
                        <Text style={styles.badgeText}>{photoCount} fotos</Text>
                      </View>
                      {party.policyNumber && (
                        <View style={[styles.badge, { backgroundColor: '#10B98120' }]}>
                          <FileText size={12} color="#10B981" />
                          <Text style={[styles.badgeText, { color: '#10B981' }]}>Póliza cargada</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.tabIconDefault} />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={handleAddParty}
            style={[styles.addButton, { borderColor: theme.tint }]}
          >
            <Plus size={24} color={theme.tint} />
            <Text style={[styles.addButtonText, { color: theme.tint }]}>
              {parties.length === 0 ? 'Cargar primer involucrado' : 'Agregar otro involucrado'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => onNext(step.nextStep)}
        disabled={parties.length === 0}
        style={[
          styles.nextButton,
          { backgroundColor: parties.length > 0 ? theme.tint : theme.border }
        ]}
      >
        <Text style={styles.nextButtonText}>Finalizar Intercambio</Text>
      </TouchableOpacity>

      <Modal
        visible={!!selectedPartyId}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
           <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ficha del involucrado: {selectedIndex + 1}</Text>
              <TouchableOpacity onPress={() => setSelectedPartyId(null)} style={styles.closeButton}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
           </View>
           
           <View style={styles.modalBody}>
             <ChecklistStep 
                partyId={selectedPartyId || undefined}
                step={{
                  ...step,
                  id: `party-${selectedPartyId}`,
                  text: 'Relevamiento de Datos',
                  subtitle: `Involucrado #${selectedIndex + 1}`,
                }} 
                onNext={() => setSelectedPartyId(null)} 
             />
           </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  list: {
    gap: 16,
    paddingBottom: 20,
  },
  partyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    minHeight: 100,
  },
  partyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  partyTitle: {
    fontSize: 11,
    opacity: 0.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  partyName: {
    fontSize: 18,
    fontWeight: '900',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButton: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    padding: 8,
  }
});
