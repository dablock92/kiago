import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserSettings {
  userName: string;
  userEmail: string;
  insuranceName: string;
  insuranceEmail: string;
  userPlate: string;
  userPolicy: string;
}

interface SettingsState {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const initialSettings: UserSettings = {
  userName: '',
  userEmail: '',
  insuranceName: '',
  insuranceEmail: '',
  userPlate: '',
  userPolicy: '',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: initialSettings,
      updateSettings: (newSettings) => 
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
    }),
    {
      name: 'kiago-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
