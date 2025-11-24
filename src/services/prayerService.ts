// Diyanet API servisi
import AsyncStorage from '@react-native-async-storage/async-storage';

const DIYANET_BASE_URL = 'https://ezanvakti.herokuapp.com';
const FALLBACK_API = 'https://api.aladhan.com/v1/timingsByCity';
const CACHE_KEY_PREFIX = 'prayer_times_';
const CACHE_VERSION = 'v1_';

export interface PrayerTimesResponse {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
  HicriTarihUzun?: string;
  MiladiTarihKisa?: string;
}

export interface MonthlyPrayerTimes {
  [day: string]: PrayerTimesResponse;
}

export interface CachedPrayerData {
  city: string;
  month: string;
  year: number;
  data: MonthlyPrayerTimes;
  cachedAt: number;
}

export interface LocationData {
  city: string;
  district?: string;
}

/**
 * Cache'den aylık vakitleri al
 */
const getCachedMonthlyTimes = async (
  city: string,
  year: number,
  month: number
): Promise<MonthlyPrayerTimes | null> => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${CACHE_VERSION}${city}_${year}_${month}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) {
      console.log('Cache bulunamadı');
      return null;
    }

    const data: CachedPrayerData = JSON.parse(cached);
    
    // Cache 30 günden eskiyse geçersiz
    const cacheAge = Date.now() - data.cachedAt;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    
    if (cacheAge > thirtyDays) {
      console.log('Cache eski, siliniyor');
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    console.log('Cache bulundu, kullanılıyor');
    return data.data;
  } catch (error) {
    console.error('Cache okuma hatası:', error);
    return null;
  }
};

/**
 * Aylık vakitleri cache'e kaydet
 */
const cacheMonthlyTimes = async (
  city: string,
  year: number,
  month: number,
  data: MonthlyPrayerTimes
): Promise<void> => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${CACHE_VERSION}${city}_${year}_${month}`;
    const cacheData: CachedPrayerData = {
      city,
      month: month.toString(),
      year,
      data,
      cachedAt: Date.now(),
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('Vakitler cache\'e kaydedildi');
  } catch (error) {
    console.error('Cache yazma hatası:', error);
  }
};

/**
 * Aylık namaz vakitlerini çeker (API'den veya cache'den)
 */
export const getMonthlyPrayerTimes = async (
  city: string,
  year: number,
  month: number
): Promise<MonthlyPrayerTimes | null> => {
  // Önce cache'e bak
  const cached = await getCachedMonthlyTimes(city, year, month);
  if (cached) {
    return cached;
  }

  // Cache yoksa API'den çek
  try {
    console.log(`API'den aylık vakitler çekiliyor: ${city}, ${year}/${month}`);
    
    // Aladhan API - Aylık vakitler
    const response = await fetch(
      `https://api.aladhan.com/v1/calendarByCity?city=${encodeURIComponent(city)}&country=Turkey&method=13&month=${month}&year=${year}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.data || result.data.length === 0) {
      throw new Error('Boş veri');
    }

    // Verileri düzenle
    const monthlyData: MonthlyPrayerTimes = {};
    
    result.data.forEach((day: any) => {
      const dayNumber = day.date.gregorian.day;
      const timings = day.timings;
      
      monthlyData[dayNumber] = {
        imsak: timings.Fajr.split(' ')[0] || '00:00',
        gunes: timings.Sunrise.split(' ')[0] || '00:00',
        ogle: timings.Dhuhr.split(' ')[0] || '00:00',
        ikindi: timings.Asr.split(' ')[0] || '00:00',
        aksam: timings.Maghrib.split(' ')[0] || '00:00',
        yatsi: timings.Isha.split(' ')[0] || '00:00',
      };
    });

    // Cache'e kaydet
    await cacheMonthlyTimes(city, year, month, monthlyData);
    
    return monthlyData;
  } catch (error) {
    console.error('Aylık vakitler alınamadı:', error);
    return null;
  }
};

/**
 * Bugünün namaz vakitlerini al (cache'den veya API'den)
 */
export const getTodayPrayerTimes = async (city: string): Promise<PrayerTimesResponse | null> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-11 -> 1-12
  const day = now.getDate();

  console.log(`📅 Bugün: ${year}/${month}/${day} - Şehir: ${city}`);

  // Aylık vakitleri al
  const monthlyTimes = await getMonthlyPrayerTimes(city, year, month);
  
  if (monthlyTimes && monthlyTimes[day]) {
    console.log('✅ Bugünün vakitleri CACHE\'den alındı');
    return monthlyTimes[day];
  }

  // Cache yoksa fallback API'ye geç
  console.log('⚠️ Cache\'de veri yok, fallback API kullanılıyor');
  return await getPrayerTimesByCity(city);
};
export const getPrayerTimesByCity = async (city: string): Promise<PrayerTimesResponse | null> => {
  try {
    console.log('API çağrısı yapılıyor:', city);
    const response = await fetch(`${DIYANET_BASE_URL}/vakitler/${encodeURIComponent(city)}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('Diyanet API başarısız, fallback API deneniyor...');
      return await getPrayerTimesByAladhan(city);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (!data || data.length === 0) {
      console.warn('Boş veri, fallback API deneniyor...');
      return await getPrayerTimesByAladhan(city);
    }
    
    return {
      imsak: data[0]?.Imsak || '00:00',
      gunes: data[0]?.Gunes || '00:00',
      ogle: data[0]?.Ogle || '00:00',
      ikindi: data[0]?.Ikindi || '00:00',
      aksam: data[0]?.Aksam || '00:00',
      yatsi: data[0]?.Yatsi || '00:00',
      HicriTarihUzun: data[0]?.HicriTarihUzun,
      MiladiTarihKisa: data[0]?.MiladiTarihKisa,
    };
  } catch (error) {
    console.error('Diyanet API hatası:', error);
    return await getPrayerTimesByAladhan(city);
  }
};

/**
 * Fallback API - Aladhan
 */
const getPrayerTimesByAladhan = async (city: string): Promise<PrayerTimesResponse | null> => {
  try {
    console.log('Aladhan API çağrısı:', city);
    const response = await fetch(
      `${FALLBACK_API}?city=${encodeURIComponent(city)}&country=Turkey&method=13`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Aladhan API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.timings) {
      throw new Error('Geçersiz API yanıtı');
    }

    const timings = data.data.timings;
    
    return {
      imsak: timings.Fajr || '00:00',
      gunes: timings.Sunrise || '00:00',
      ogle: timings.Dhuhr || '00:00',
      ikindi: timings.Asr || '00:00',
      aksam: timings.Maghrib || '00:00',
      yatsi: timings.Isha || '00:00',
    };
  } catch (error) {
    console.error('Aladhan API hatası:', error);
    // Son çare - varsayılan vakitler
    return {
      imsak: '05:30',
      gunes: '07:00',
      ogle: '12:30',
      ikindi: '15:15',
      aksam: '17:45',
      yatsi: '19:15',
    };
  }
};

/**
 * Koordinatlara göre en yakın şehri bulur
 */
export const getCityFromCoordinates = (
  latitude: number,
  longitude: number,
  cityName?: string
): string => {
  // Türkiye'nin büyük şehirlerinin koordinatları
  const cities: { [key: string]: { lat: number; lon: number } } = {
    'Istanbul': { lat: 41.0082, lon: 28.9784 },
    'Ankara': { lat: 39.9334, lon: 32.8597 },
    'Izmir': { lat: 38.4237, lon: 27.1428 },
    'Bursa': { lat: 40.1826, lon: 29.0665 },
    'Antalya': { lat: 36.8969, lon: 30.7133 },
    'Adana': { lat: 37.0017, lon: 35.3289 },
    'Konya': { lat: 37.8746, lon: 32.4932 },
    'Gaziantep': { lat: 37.0662, lon: 37.3833 },
    'Kayseri': { lat: 38.7205, lon: 35.4826 },
    'Diyarbakır': { lat: 37.9144, lon: 40.2306 },
  };

  // Eğer şehir adı varsa direkt kullan
  if (cityName) {
    const normalizedCity = cityName
      .toLowerCase()
      .replace('i̇', 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ö/g, 'o');

    for (const city in cities) {
      if (city.toLowerCase() === normalizedCity) {
        return city;
      }
    }
  }

  // En yakın şehri bul
  let closestCity = 'Istanbul';
  let minDistance = Infinity;

  for (const [city, coords] of Object.entries(cities)) {
    const distance = Math.sqrt(
      Math.pow(latitude - coords.lat, 2) + Math.pow(longitude - coords.lon, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  }

  return closestCity;
};

/**
 * Şehir adını Türkçe karakterlerden temizler
 */
export const normalizeCityName = (city: string): string => {
  return city
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c');
};
