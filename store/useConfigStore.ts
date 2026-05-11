import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ConfigState {
  country: string;
  province: string;
  language: string;
  setCountry: (country: string) => void;
  setProvince: (province: string) => void;
  setLanguage: (language: string) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      country: "Argentina",
      province: "CABA",
      language: "Español",
      setCountry: (country) => set({ country }),
      setProvince: (province) => set({ province }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "config-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
