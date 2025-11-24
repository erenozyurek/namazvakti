import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Zikir {
  id: string;
  title: string;
  count: number;
  target: number;
}

const STORAGE_KEY = '@zikirler';

export const getZikirler = async (): Promise<Zikir[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Zikirler okunurken hata:', e);
    return [];
  }
};

export const saveZikir = async (zikir: Zikir): Promise<void> => {
  try {
    const currentZikirler = await getZikirler();
    const existingIndex = currentZikirler.findIndex((z) => z.id === zikir.id);

    let newZikirler;
    if (existingIndex >= 0) {
      newZikirler = [...currentZikirler];
      newZikirler[existingIndex] = zikir;
    } else {
      newZikirler = [...currentZikirler, zikir];
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newZikirler));
  } catch (e) {
    console.error('Zikir kaydedilirken hata:', e);
  }
};

export const deleteZikir = async (id: string): Promise<void> => {
  try {
    const currentZikirler = await getZikirler();
    const newZikirler = currentZikirler.filter((z) => z.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newZikirler));
  } catch (e) {
    console.error('Zikir silinirken hata:', e);
  }
};
