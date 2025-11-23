import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cache istatistiklerini göster
 */
export const getCacheStats = async (): Promise<{
  totalItems: number;
  totalSize: string;
  cities: string[];
}> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prayerKeys = keys.filter((key) => key.startsWith('prayer_times_'));

    let totalSize = 0;
    const cities = new Set<string>();

    for (const key of prayerKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        // prayer_times_v1_Istanbul_2025_11 -> Istanbul
        const parts = key.split('_');
        if (parts.length >= 4) {
          cities.add(parts[3]);
        }
      }
    }

    return {
      totalItems: prayerKeys.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      cities: Array.from(cities),
    };
  } catch (error) {
    console.error('Cache stats hatası:', error);
    return {
      totalItems: 0,
      totalSize: '0 KB',
      cities: [],
    };
  }
};

/**
 * Tüm cache'i temizle
 */
export const clearPrayerCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prayerKeys = keys.filter((key) => key.startsWith('prayer_times_'));
    await AsyncStorage.multiRemove(prayerKeys);
    console.log(`${prayerKeys.length} cache kaydı silindi`);
  } catch (error) {
    console.error('Cache temizleme hatası:', error);
  }
};

/**
 * Eski cache kayıtlarını temizle (30 günden eski)
 */
export const cleanOldCache = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prayerKeys = keys.filter((key) => key.startsWith('prayer_times_'));
    
    let deletedCount = 0;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    for (const key of prayerKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        const data = JSON.parse(value);
        const age = Date.now() - data.cachedAt;
        
        if (age > thirtyDays) {
          await AsyncStorage.removeItem(key);
          deletedCount++;
        }
      }
    }

    console.log(`${deletedCount} eski cache kaydı silindi`);
    return deletedCount;
  } catch (error) {
    console.error('Eski cache temizleme hatası:', error);
    return 0;
  }
};

/**
 * Önümüzdeki ayın vakitlerini önceden yükle
 */
export const preloadNextMonth = async (city: string): Promise<void> => {
  try {
    const { getMonthlyPrayerTimes } = require('./prayerService');
    
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    await getMonthlyPrayerTimes(
      city,
      nextMonth.getFullYear(),
      nextMonth.getMonth() + 1
    );
    
    console.log('Gelecek ay vakitleri yüklendi');
  } catch (error) {
    console.error('Önden yükleme hatası:', error);
  }
};
