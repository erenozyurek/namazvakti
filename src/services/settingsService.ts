import AsyncStorage from '@react-native-async-storage/async-storage';

const EZAN_KEY = 'selected_ezan';

export type EzanType = 'ezan1' | 'ezan2';

export const saveEzanSelection = async (ezan: EzanType) => {
  try {
    await AsyncStorage.setItem(EZAN_KEY, ezan);
  } catch (e) {
    console.error('Ezan seçimi kaydedilemedi:', e);
  }
};

export const getEzanSelection = async (): Promise<EzanType> => {
  try {
    const value = await AsyncStorage.getItem(EZAN_KEY);
    if (value === 'ezan1' || value === 'ezan2') return value;
    return 'ezan1'; // default
  } catch (e) {
    console.error('Ezan seçimi okunamadı:', e);
    return 'ezan1';
  }
};
