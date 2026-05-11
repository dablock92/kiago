import * as Haptics from 'expo-haptics';
import { Camera as CameraIcon, Check, CheckCircle2, Circle, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { ChecklistItem, Step } from '../../../engine/types';
import { InvolvedParty, useIncidentStore } from '../../../store/useIncidentStore';
import { CameraView } from '../CameraView';

interface Props {
  step: Step;
  onNext: (nextId?: string) => void;
  partyId?: string;
}

// Función utilitaria para detectar imágenes de forma segura
const isImageUri = (val: any): boolean => {
  return typeof val === 'string' && val.startsWith('file://');
};

export function ChecklistStep({ step, onNext, partyId }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { currentIncident, updateResponse, updateInvolvedParty } = useIncidentStore();

  const [activeItem, setActiveItem] = useState<ChecklistItem | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraSide, setCameraSide] = useState<'front' | 'back' | null>(null);
  const [useDniPhotoLocal, setUseDniPhotoLocal] = useState(false);
  const [tempDniPhotos, setTempDniPhotos] = useState<{front?: string, back?: string}>({});

  const currentParty = useMemo(() => 
    partyId ? currentIncident?.involvedParties.find(p => p.id === partyId) : null
  , [partyId, currentIncident]);

  useEffect(() => {
    if (activeItem?.id === 'dni_photos' && currentParty) {
      setTempDniPhotos({
        front: currentParty.photos?.dniFront,
        back: currentParty.photos?.dniBack
      });
    }
  }, [activeItem, currentParty]);

  const items = useMemo(() => {
    return (step?.checklistItems || []).map((item, index) => {
      if (typeof item === 'string') {
        return { id: `item-${index}`, label: item, type: 'info' } as ChecklistItem;
      }
      return item;
    });
  }, [step]);

  const responses = useMemo(() => {
    if (partyId && currentParty) {
      return {
        aseguradora: currentParty.insuranceCompany,
        poliza_num: currentParty.policyNumber,
        vigencia_seguro: currentParty.insuranceValidity,
        dominio_patente: currentParty.plate,
        nombre_titular: currentParty.ownerName,
        conductor_nombre: currentParty.name ? `${currentParty.name} ${currentParty.surname}` : undefined,
        conductor_tel: currentParty.phone,
        dni_photos: currentParty.photos?.dniFront && currentParty.photos?.dniBack ? 'AMBOS_LADOS' : undefined,
        licencia_img: currentParty.photos?.license,
        fotos_danos: (currentParty.photos?.damage?.length || 0) > 0 ? `${currentParty.photos?.damage?.length} fotos` : undefined,
      } as Record<string, any>;
    }
    return currentIncident?.responses?.[step?.id] || {};
  }, [currentIncident, step, partyId, currentParty]);

  const completedIds = Object.keys(responses).filter(key => !!responses[key]);
  
  const allCompleted = useMemo(() => {
    if (partyId && currentParty) {
      const requiredItems = items.filter(i => i.required);
      return requiredItems.every(item => !!responses[item.id]);
    }
    return completedIds.length >= items.filter(i => i.type !== 'info' && i.type !== 'section').length;
  }, [partyId, currentParty, responses, items, completedIds]);

  const handleItemPress = (item: ChecklistItem) => {
    if (item.type === 'section') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.type === 'info') {
      const isDone = completedIds.includes(item.id);
      updateResponse(step.id, { ...responses, [item.id]: !isDone });
    } else {
      setActiveItem(item);
      const val = responses[item.id] || '';
      if (item.fields) {
        const initialData: Record<string, string> = {};
        if (partyId && currentParty) {
           initialData['nombre'] = currentParty.name || '';
           initialData['apellido'] = currentParty.surname || '';
           setUseDniPhotoLocal(!!currentParty.useDniPhoto);
        } else {
           const parts = typeof val === 'string' ? val.split(' ') : [];
           item.fields.forEach((f, i) => initialData[f.id] = parts[i] || '');
        }
        setFormData(initialData);
      } else {
        setFormData({ [item.id]: String(val) });
      }
      setIsPhotoMode(item.type === 'photo' || isImageUri(responses[item.id]));
    }
  };

  const handleSaveItem = (valueOverride?: string) => {
    if (!activeItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (cameraSide) {
      setTempDniPhotos(prev => ({ ...prev, [cameraSide]: valueOverride }));
      setCameraSide(null);
      return;
    }

    let finalValue = valueOverride;
    if (!finalValue) {
      if (activeItem.fields) {
        finalValue = activeItem.fields.map(f => formData[f.id]).filter(Boolean).join(' ');
      } else {
        finalValue = formData[activeItem.id];
      }
    }

    if (partyId) {
      const update: Partial<InvolvedParty> = {};
      const photosUpdate = { ...(currentParty?.photos || {}) };

      if (activeItem.id === 'conductor_nombre') {
        if (useDniPhotoLocal) {
          update.name = 'Ver en foto';
          update.surname = 'de DNI';
          update.useDniPhoto = true;
        } else {
          update.name = formData['nombre'];
          update.surname = formData['apellido'];
          update.useDniPhoto = false;
        }
      } 
      else if (activeItem.id === 'aseguradora') update.insuranceCompany = finalValue;
      else if (activeItem.id === 'poliza_num') update.policyNumber = finalValue;
      else if (activeItem.id === 'vigencia_seguro') update.insuranceValidity = finalValue;
      else if (activeItem.id === 'dominio_patente') update.plate = finalValue;
      else if (activeItem.id === 'nombre_titular') update.ownerName = finalValue;
      else if (activeItem.id === 'conductor_tel') update.phone = finalValue;
      else if (activeItem.id === 'licencia_img') photosUpdate.license = finalValue;
      else if (activeItem.id === 'dni_photos') {
        photosUpdate.dniFront = tempDniPhotos.front;
        photosUpdate.dniBack = tempDniPhotos.back;
      }
      else if (activeItem.id === 'fotos_danos') {
        photosUpdate.damage = [...(photosUpdate.damage || []), finalValue!];
      }

      update.photos = photosUpdate;
      updateInvolvedParty(partyId, update);
    } else {
      updateResponse(step.id, { ...responses, [activeItem.id]: finalValue });
    }

    if (activeItem.id === 'dni_photos' && !valueOverride) {
      // keep
    } else if (activeItem.id === 'dni_photos' && valueOverride) {
       setCameraSide(null);
    } else {
      setActiveItem(null);
      setIsPhotoMode(false);
      setCameraSide(null);
    }
  };

  const onCapturePhoto = (uri: string) => {
    handleSaveItem(uri);
    setShowCamera(false);
  };

  if (showCamera) {
    return <CameraView onCapture={onCapturePhoto} onClose={() => { setShowCamera(false); setCameraSide(null); }} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {items.map((item) => {
            const isDone = !!responses[item.id];
            const value = responses[item.id];
            const isImage = isImageUri(value);
            
            if (item.type === 'section') {
              return (
                <View key={item.id} style={styles.sectionHeader}>
                  <Text style={[styles.sectionLabel, { color: theme.tabIconDefault }]}>
                    {item?.label}
                  </Text>
                  <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemPress(item)}
                style={[
                  styles.item,
                  { backgroundColor: 'transparent', borderColor: isDone ? '#10B981' : theme.border }
                ]}
              >
                <View style={styles.itemContent}>
                  {isDone ? (
                    <CheckCircle2 size={24} color="#10B981" />
                  ) : (
                    <Circle size={24} color={theme.text} opacity={0.3} />
                  )}
                  <View style={styles.textContainer}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.itemLabel, isDone && styles.itemDone]}>{item?.label}</Text>
                      {item?.required && !isDone && <Text style={styles.asterisk}>*</Text>}
                    </View>
                    {isDone && item.type !== 'info' && (
                      <Text 
                        numberOfLines={1}
                        style={{ fontSize: 11, color: '#10B981', fontWeight: 'bold', marginTop: 0 }}
                      >
                        {item.id === 'dni_photos' 
                          ? '✅ Ambos lados' 
                          : isImage 
                            ? '✅ Foto capturada' 
                            : value}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => onNext(step.nextStep)}
        disabled={!allCompleted}
        style={[
          styles.nextButton,
          { backgroundColor: allCompleted ? theme.tint : theme.border }
        ]}
      >
        <Text style={styles.nextButtonText}>{partyId ? 'Cerrar Ficha' : 'Continuar'}</Text>
      </TouchableOpacity>

      <Modal visible={!!activeItem} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeItem?.label}</Text>
              <TouchableOpacity onPress={() => { setActiveItem(null); setIsPhotoMode(false); setCameraSide(null); }}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {activeItem?.id === 'dni_photos' ? (
              <View style={styles.dualPhotoContainer}>
                 <View style={styles.photoRow}>
                    <TouchableOpacity 
                      onPress={() => { setCameraSide('front'); setShowCamera(true); }}
                      style={[styles.photoSlot, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                      {tempDniPhotos.front ? (
                        <Image source={{ uri: tempDniPhotos.front }} style={styles.previewImage} />
                      ) : (
                        <>
                          <CameraIcon size={32} color={theme.tint} />
                          <Text style={styles.slotLabel}>FRENTE</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => { setCameraSide('back'); setShowCamera(true); }}
                      style={[styles.photoSlot, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                      {tempDniPhotos.back ? (
                        <Image source={{ uri: tempDniPhotos.back }} style={styles.previewImage} />
                      ) : (
                        <>
                          <CameraIcon size={32} color={theme.tint} />
                          <Text style={styles.slotLabel}>DORSO</Text>
                        </>
                      )}
                    </TouchableOpacity>
                 </View>
                 <TouchableOpacity 
                    onPress={() => handleSaveItem()}
                    disabled={!(tempDniPhotos.front && tempDniPhotos.back)}
                    style={[
                      styles.saveButton, 
                      { 
                        backgroundColor: (tempDniPhotos.front && tempDniPhotos.back) ? theme.tint : theme.border,
                        marginTop: 20 
                      }
                    ]}
                  >
                    <Text style={styles.saveButtonText}>Guardar fotos</Text>
                  </TouchableOpacity>
              </View>
            ) : (isPhotoMode || activeItem?.type === 'photo' || activeItem?.type === 'camera') ? (
              <View style={styles.photoContainer}>
                <TouchableOpacity 
                  onPress={() => setShowCamera(true)}
                  style={[styles.photoButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <CameraIcon size={64} color={theme.tint} />
                  <Text style={styles.photoText}>Tocar para capturar foto</Text>
                </TouchableOpacity>
                {activeItem?.allowPhoto && (
                  <TouchableOpacity onPress={() => setIsPhotoMode(false)} style={styles.switchButton}>
                    <Text style={{ color: theme.tint }}>Prefiero escribir el dato</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.inputContainer}>
                {activeItem?.fields ? (
                  <>
                    <View style={styles.fieldsGrid}>
                      {activeItem.fields.map(field => (
                        <View key={field.id} style={styles.fieldWrapper}>
                          <Text style={styles.fieldLabel}>{field.label}</Text>
                          <TextInput
                            style={[
                              styles.input, 
                              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                              useDniPhotoLocal && { opacity: 0.5 }
                            ]}
                            placeholder={field.placeholder || field.label}
                            placeholderTextColor={theme.tabIconDefault}
                            value={formData[field.id]}
                            onChangeText={(text) => setFormData({ ...formData, [field.id]: text })}
                            editable={!useDniPhotoLocal}
                          />
                        </View>
                      ))}
                    </View>

                    {activeItem.id === 'conductor_nombre' && (
                      <TouchableOpacity 
                        style={[styles.toggleContainer, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() => setUseDniPhotoLocal(!useDniPhotoLocal)}
                        activeOpacity={0.7}
                      >
                         <View style={styles.toggleInfo}>
                            <Text style={styles.toggleTitle}>USAR FOTO DE DNI</Text>
                            <Text style={styles.toggleSub}>Completa el nombre con las fotos</Text>
                         </View>
                         <Switch 
                            value={useDniPhotoLocal} 
                            onValueChange={setUseDniPhotoLocal}
                            trackColor={{ false: theme.border, true: theme.tint }}
                         />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                      placeholder="Escribir aquí..."
                      placeholderTextColor={theme.tabIconDefault}
                      value={formData[activeItem?.id || '']}
                      onChangeText={(text) => setFormData({ [activeItem?.id || '']: text })}
                      autoFocus
                    />
                    {activeItem?.allowPhoto && (
                      <TouchableOpacity 
                        onPress={() => setIsPhotoMode(true)}
                        style={[styles.inputIcon, { backgroundColor: theme.border }]}
                      >
                        <CameraIcon size={20} color={theme.text} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                
                <TouchableOpacity 
                  onPress={() => handleSaveItem()}
                  style={[styles.saveButton, { backgroundColor: theme.tint, marginTop: 10 }]}
                >
                  <Check size={24} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    marginTop: 10,
    gap: 12,
    paddingBottom: 20,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  item: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    minHeight: 70,
    justifyContent: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  asterisk: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDone: {
    opacity: 0.5,
  },
  nextButton: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  inputContainer: {
    gap: 16,
  },
  fieldsGrid: {
    gap: 12,
  },
  fieldWrapper: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 18,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    padding: 12,
    borderRadius: 16,
  },
  saveButton: {
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoContainer: {
    gap: 20,
  },
  photoButton: {
    height: 200,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  photoText: {
    fontSize: 18,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  switchButton: {
    alignItems: 'center',
    padding: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleSub: {
    fontSize: 12,
    opacity: 0.6,
  },
  dualPhotoContainer: {
    gap: 12,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  slotLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  }
});
