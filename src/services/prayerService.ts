// Diyanet API servisi
import AsyncStorage from '@react-native-async-storage/async-storage';

const DIYANET_BASE_URL = 'https://api.collectapi.com/pray/all';
const FALLBACK_API = 'https://api.aladhan.com/v1/timingsByCity';
const CACHE_KEY_PREFIX = 'prayer_times_';
const CACHE_VERSION = 'v2_';
const LAST_PRAYER_CACHE_KEY = 'last_prayer_times_backup';
const LAST_CITY_CACHE_KEY = 'last_city_used';
const LAST_FETCH_TIME_KEY = 'last_fetch_time';

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

// Alias for internal use
type PrayerTimes = PrayerTimesResponse;

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
export const getCachedMonthlyTimes = async (
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
 * Son kullanılan namaz vakitlerini yedek olarak kaydet
 */
const saveLastPrayerCache = async (city: string, data: PrayerTimes): Promise<void> => {
  try {
    const backupData = {
      city,
      data,
      cachedAt: Date.now(),
    };
    
    await AsyncStorage.multiSet([
      [LAST_PRAYER_CACHE_KEY, JSON.stringify(backupData)],
      [LAST_CITY_CACHE_KEY, city],
    ]);
    
    console.log('✅ Son vakitler yedeklendi:', city);
  } catch (error) {
    console.error('❌ Yedek cache hatası:', error);
  }
};

/**
 * Son yedeklenen namaz vakitlerini al
 */
const getLastPrayerCache = async (): Promise<{ city: string; data: PrayerTimes; cachedAt: number } | null> => {
  try {
    const cached = await AsyncStorage.getItem(LAST_PRAYER_CACHE_KEY);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    console.log('📦 Son yedek cache kullanılıyor:', parsed.city);
    return parsed;
  } catch (error) {
    console.error('❌ Yedek cache okuma hatası:', error);
    return null;
  }
};

/**
 * Son kullanılan şehri al
 */
export const getLastCachedCity = async (): Promise<string | null> => {
  try {
    const city = await AsyncStorage.getItem(LAST_CITY_CACHE_KEY);
    return city;
  } catch (error) {
    console.error('❌ Son şehir okuma hatası:', error);
    return null;
  }
};

/**
 * Şehirlerin aynı olup olmadığını kontrol et (Türkçe karakter toleranslı)
 */
export const isSameCity = (city1: string | null, city2: string | null): boolean => {
  if (!city1 || !city2) return false;
  
  const normalize = (city: string) => city
    .toLowerCase()
    .replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i')
    .replace(/Ğ/g, 'g').replace(/ğ/g, 'g')
    .replace(/Ü/g, 'u').replace(/ü/g, 'u')
    .replace(/Ş/g, 's').replace(/ş/g, 's')
    .replace(/Ö/g, 'o').replace(/ö/g, 'o')
    .replace(/Ç/g, 'c').replace(/ç/g, 'c')
    .trim();
  
  return normalize(city1) === normalize(city2);
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
 * AKILLI NAMAZ VAKİTLERİ SİSTEMİ
 * 
 * Bu fonksiyon gereksiz API çağrılarını önler:
 * 1. Önce son kullanılan şehri kontrol eder
 * 2. Mevcut şehir == Son şehir ise → Cache'den al (API çağrısı YOK)
 * 3. Şehir değiştiyse veya cache yoksa → API'den çek
 * 
 * @param currentCity - Kullanıcının mevcut konumundan alınan şehir
 * @returns Namaz vakitleri veya null
 */
export const getSmartPrayerTimes = async (currentCity: string): Promise<{
  times: PrayerTimesResponse | null;
  fromCache: boolean;
  cityChanged: boolean;
}> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  console.log('🧠 Akıllı Namaz Vakitleri Sistemi Başlatıldı');
  console.log(`📍 Mevcut Şehir: ${currentCity}`);

  // 1. Son kullanılan şehri kontrol et
  const lastCity = await getLastCachedCity();
  console.log(`📦 Son Kaydedilen Şehir: ${lastCity || 'Yok'}`);

  // 2. Şehir aynı mı kontrol et
  const cityIsSame = isSameCity(currentCity, lastCity);
  
  if (cityIsSame) {
    console.log('✅ Şehir aynı, cache kontrol ediliyor...');
    
    // Aylık cache'i kontrol et
    const monthlyTimes = await getCachedMonthlyTimes(currentCity, year, month);
    
    if (monthlyTimes && monthlyTimes[day]) {
      console.log('🎉 Cache\'den veri alındı - API ÇAĞRISI YAPILMADI');
      return {
        times: monthlyTimes[day],
        fromCache: true,
        cityChanged: false,
      };
    }
    
    console.log('⚠️ Aynı şehir ama cache yok/eski, API çağrılacak');
  } else {
    console.log('🔄 Şehir değişti! Yeni vakitler çekilecek');
  }

  // 3. API'den çek (şehir değişti veya cache yok)
  console.log(`🌐 API'den vakitler çekiliyor: ${currentCity}`);
  
  const monthlyTimes = await getMonthlyPrayerTimes(currentCity, year, month);
  
  if (monthlyTimes && monthlyTimes[day]) {
    // Yeni şehri ve vakitleri kaydet
    await saveLastPrayerCache(currentCity, monthlyTimes[day]);
    
    console.log('✅ Vakitler API\'den alındı ve cache\'e kaydedildi');
    return {
      times: monthlyTimes[day],
      fromCache: false,
      cityChanged: !cityIsSame,
    };
  }

  // 4. Aylık API başarısız, günlük API dene
  console.log('⚠️ Aylık API başarısız, günlük API deneniyor...');
  const dailyTimes = await getPrayerTimesByCity(currentCity);
  
  if (dailyTimes) {
    await saveLastPrayerCache(currentCity, dailyTimes);
    return {
      times: dailyTimes,
      fromCache: false,
      cityChanged: !cityIsSame,
    };
  }

  // 5. Tüm API'ler başarısız, son cache'i dön
  console.log('❌ API başarısız, son cache kullanılıyor');
  const lastCache = await getLastPrayerCache();
  return {
    times: lastCache?.data || null,
    fromCache: true,
    cityChanged: false,
  };
};

/**
 * Bugünün namaz vakitlerini al (akıllı cache sistemi)
 * 1. Konum varsa → API'den çek, cache'e kaydet
 * 2. Konum yoksa → son cache'i kullan
 */
export const getTodayPrayerTimes = async (city: string | null): Promise<PrayerTimesResponse | null> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  console.log(`📅 Bugün: ${year}/${month}/${day} - Şehir: ${city || 'Bilinmiyor'}`);

  // Eğer konum yoksa, son yedeklenen cache'i kullan
  if (!city) {
    console.log('⚠️ Konum bilgisi yok, son cache kullanılıyor');
    const lastCache = await getLastPrayerCache();
    
    if (lastCache) {
      const cacheAge = Math.floor((Date.now() - lastCache.cachedAt) / (1000 * 60 * 60)); // saat cinsinden
      console.log(`📦 Son yedek cache: ${lastCache.city} (${cacheAge} saat önce)`);
      return lastCache.data;
    }
    
    console.log('❌ Hiç cache yok');
    return null;
  }

  // Konum varsa, aylık vakitleri al
  const monthlyTimes = await getMonthlyPrayerTimes(city, year, month);
  
  if (monthlyTimes && monthlyTimes[day]) {
    console.log('✅ Bugünün vakitleri CACHE\'den alındı');
    
    // Başarılı veriyi yedekle
    await saveLastPrayerCache(city, monthlyTimes[day]);
    
    return monthlyTimes[day];
  }

  // Cache yoksa API'ye geç
  console.log('⚠️ Cache\'de veri yok, fallback API kullanılıyor');
  const apiResult = await getPrayerTimesByCity(city);
  
  if (apiResult) {
    // API'den gelen veriyi yedekle
    await saveLastPrayerCache(city, apiResult);
  }
  
  return apiResult;
};
export const getPrayerTimesByCity = async (city: string): Promise<PrayerTimesResponse | null> => {
  try {
    console.log('Aladhan API çağrısı:', city);
    // Direkt Aladhan API kullan - daha güvenilir
    const response = await fetch(
      `${FALLBACK_API}?city=${encodeURIComponent(city)}&country=Turkey&method=13`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.timings) {
      throw new Error('Geçersiz API yanıtı');
    }

    const timings = data.data.timings;
    
    return {
      imsak: timings.Fajr?.split(' ')[0] || '00:00',
      gunes: timings.Sunrise?.split(' ')[0] || '00:00',
      ogle: timings.Dhuhr?.split(' ')[0] || '00:00',
      ikindi: timings.Asr?.split(' ')[0] || '00:00',
      aksam: timings.Maghrib?.split(' ')[0] || '00:00',
      yatsi: timings.Isha?.split(' ')[0] || '00:00',
    };
  } catch (error) {
    console.error('API hatası:', error);
    return null;
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

// ==================== HAFTALİK EZAN VAKİTLERİ SERVİSİ ====================

const WEEKLY_CACHE_KEY_PREFIX = 'weekly_prayer_times_';
const WEEKLY_CACHE_VERSION = 'v1_';

export interface WeeklyPrayerTime {
  date: string; // ISO 8601 format (YYYY-MM-DD)
  gregorian: string; // Görüntüleme için formatlanmış tarih
  hijri: string; // Hicri tarih
  timings: {
    imsak: string;
    gunes: string;
    ogle: string;
    ikindi: string;
    aksam: string;
    yatsi: string;
  };
}

export interface WeeklyCacheData {
  city: string;
  country: string;
  weekStart: string; // ISO format
  weekEnd: string; // ISO format
  data: WeeklyPrayerTime[];
  cachedAt: number;
}

/**
 * Haftanın başlangıç ve bitiş tarihlerini hesaplar (Pazartesi-Pazar)
 */
const getWeekRange = (date: Date = new Date()): { start: Date; end: Date } => {
  const current = new Date(date);
  const dayOfWeek = current.getDay(); // 0=Pazar, 1=Pazartesi, ...
  
  // Pazartesi'ye ayarla (haftanın başlangıcı)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = new Date(current);
  start.setDate(current.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  
  // Pazar'a ayarla (haftanın sonu)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Tarihi ISO 8601 formatına çevirir (YYYY-MM-DD)
 */
const toISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Önbellekten haftalık vakitleri al
 */
const getCachedWeeklyTimes = async (
  city: string,
  country: string
): Promise<WeeklyPrayerTime[] | null> => {
  try {
    const { start } = getWeekRange();
    const weekStartStr = toISODate(start);
    const cacheKey = `${WEEKLY_CACHE_KEY_PREFIX}${WEEKLY_CACHE_VERSION}${city}_${country}_${weekStartStr}`;
    
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) {
      console.log('📭 Haftalık cache bulunamadı');
      return null;
    }

    const cacheData: WeeklyCacheData = JSON.parse(cached);
    
    // Bugünün tarihi cache'deki hafta içinde mi kontrol et
    const today = toISODate(new Date());
    const isInCachedWeek = cacheData.data.some(day => day.date === today);
    
    if (!isInCachedWeek) {
      console.log('🗓️ Cache eski (yeni haftaya girildi), siliniyor');
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    console.log('✅ Haftalık cache bulundu ve geçerli');
    return cacheData.data;
  } catch (error) {
    console.error('❌ Haftalık cache okuma hatası:', error);
    return null;
  }
};

/**
 * Haftalık vakitleri önbelleğe kaydet
 */
const cacheWeeklyTimes = async (
  city: string,
  country: string,
  data: WeeklyPrayerTime[]
): Promise<void> => {
  try {
    const { start, end } = getWeekRange();
    const cacheKey = `${WEEKLY_CACHE_KEY_PREFIX}${WEEKLY_CACHE_VERSION}${city}_${country}_${toISODate(start)}`;
    
    const cacheData: WeeklyCacheData = {
      city,
      country,
      weekStart: toISODate(start),
      weekEnd: toISODate(end),
      data,
      cachedAt: Date.now(),
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('💾 Haftalık vakitler cache\'e kaydedildi');
  } catch (error) {
    console.error('❌ Haftalık cache yazma hatası:', error);
  }
};

/**
 * Aladhan API'den haftalık ezan vakitlerini çeker
 * 
 * @param city - Şehir adı (dinamik)
 * @param country - Ülke adı (dinamik, varsayılan: Turkey)
 * @returns Haftalık namaz vakitleri veya null (hata durumunda)
 * 
 * Özellikler:
 * - Diyanet uyumlu (method=13)
 * - ISO 8601 tarih formatı
 * - Akıllı önbellekleme (haftalık)
 * - İnternet hatalarını yönetir
 */
export const getWeeklyPrayerTimes = async (
  city: string,
  country: string = 'Turkey'
): Promise<WeeklyPrayerTime[] | null> => {
  try {
    // 1. Önce önbelleği kontrol et
    const cachedData = await getCachedWeeklyTimes(city, country);
    if (cachedData) {
      return cachedData;
    }

    // 2. Cache yoksa veya geçersizse API'den çek
    console.log(`🌐 API'den haftalık vakitler çekiliyor: ${city}, ${country}`);
    
    const { start } = getWeekRange();
    const year = start.getFullYear();
    const month = start.getMonth() + 1; // 0-11 -> 1-12
    
    // Aladhan API - Calendar endpoint (aylık veri çeker, biz sadece bu haftayı kullanırız)
    const url = `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=13&iso8601=true`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.data || result.data.length === 0) {
      throw new Error('API\'den boş veri döndü');
    }

    // 3. Bu haftanın verilerini filtrele
    const { start: weekStart, end: weekEnd } = getWeekRange();
    const weekStartStr = toISODate(weekStart);
    const weekEndStr = toISODate(weekEnd);
    
    const weeklyData: WeeklyPrayerTime[] = [];
    
    result.data.forEach((day: any) => {
      const dateStr = day.date.gregorian.date; // DD-MM-YYYY formatında
      const [dd, mm, yyyy] = dateStr.split('-');
      const isoDate = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD formatına çevir
      
      // Bu tarih bu haftaya ait mi?
      if (isoDate >= weekStartStr && isoDate <= weekEndStr) {
        const timings = day.timings;
        
        weeklyData.push({
          date: isoDate,
          gregorian: `${dd}.${mm}.${yyyy}`,
          hijri: `${day.date.hijri.day} ${day.date.hijri.month.tr} ${day.date.hijri.year}`,
          timings: {
            imsak: timings.Fajr?.split(' ')[0] || '00:00',
            gunes: timings.Sunrise?.split(' ')[0] || '00:00',
            ogle: timings.Dhuhr?.split(' ')[0] || '00:00',
            ikindi: timings.Asr?.split(' ')[0] || '00:00',
            aksam: timings.Maghrib?.split(' ')[0] || '00:00',
            yatsi: timings.Isha?.split(' ')[0] || '00:00',
          },
        });
      }
    });

    // Tarihe göre sırala (Pazartesi'den başlayarak)
    weeklyData.sort((a, b) => a.date.localeCompare(b.date));

    // 4. Önbelleğe kaydet
    await cacheWeeklyTimes(city, country, weeklyData);

    // 5. Veriyi döndür
    console.log(`✅ ${weeklyData.length} günlük veri başarıyla alındı`);
    return weeklyData;

  } catch (error) {
    console.error('❌ Haftalık vakitler çekme hatası:', error);
    
    // Hata detaylarını logla
    if (error instanceof Error) {
      console.error('Hata mesajı:', error.message);
    }
    
    // İnternet bağlantısı yoksa veya API'ye erişilemiyorsa null döndür
    return null;
  }
};

/**
 * Bugünün ezan vakitlerini haftalık veriden al (akıllı cache sistemi)
 * 1. Konum varsa → haftalık veri al, cache'e kaydet
 * 2. Konum yoksa → son cache'i kullan
 */
export const getTodayFromWeeklyTimes = async (
  city: string | null,
  country: string = 'Turkey'
): Promise<PrayerTimesResponse | null> => {
  try {
    // Eğer konum yoksa, son yedeklenen cache'i kullan
    if (!city) {
      console.log('⚠️ Konum bilgisi yok, son cache kullanılıyor');
      const lastCache = await getLastPrayerCache();
      
      if (lastCache) {
        const cacheAge = Math.floor((Date.now() - lastCache.cachedAt) / (1000 * 60 * 60));
        console.log(`📦 Son yedek cache: ${lastCache.city} (${cacheAge} saat önce)`);
        return lastCache.data;
      }
      
      console.log('❌ Hiç cache yok');
      return null;
    }

    // Konum varsa haftalık veriyi al
    const weeklyData = await getWeeklyPrayerTimes(city, country);
    
    if (!weeklyData) {
      // API başarısız, son cache'i dene
      console.log('⚠️ Haftalık veri alınamadı, son cache kullanılıyor');
      const lastCache = await getLastPrayerCache();
      return lastCache ? lastCache.data : null;
    }

    const today = toISODate(new Date());
    const todayData = weeklyData.find(day => day.date === today);
    
    if (!todayData) {
      console.warn('⚠️ Bugünün verisi haftalık veride bulunamadı');
      const lastCache = await getLastPrayerCache();
      return lastCache ? lastCache.data : null;
    }

    const result = {
      imsak: todayData.timings.imsak,
      gunes: todayData.timings.gunes,
      ogle: todayData.timings.ogle,
      ikindi: todayData.timings.ikindi,
      aksam: todayData.timings.aksam,
      yatsi: todayData.timings.yatsi,
    };

    // Başarılı veriyi yedekle
    await saveLastPrayerCache(city, result);
    
    return result;
  } catch (error) {
    console.error('❌ Bugünün vakitleri alınamadı:', error);
    
    // Hata durumunda son cache'i kullan
    const lastCache = await getLastPrayerCache();
    return lastCache ? lastCache.data : null;
  }
};

