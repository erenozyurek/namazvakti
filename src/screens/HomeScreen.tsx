import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NextPrayerCard } from '../components/NextPrayerCard';
import { PrayerCard } from '../components/PrayerCard';
import { preloadNextMonth } from '../services/cacheManager';
import { getCityFromCoordinates, getSmartPrayerTimes, getTodayPrayerTimes } from '../services/prayerService';

interface PrayerTime {
  name: string;
  time: string;
}

export const HomeScreen: React.FC = () => {
  const [location, setLocation] = useState<string>('Konum alınıyor...');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [nextPrayer, setNextPrayer] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([
    { name: 'İmsak', time: '--:--' },
    { name: 'Güneş', time: '--:--' },
    { name: 'Öğle', time: '--:--' },
    { name: 'İkindi', time: '--:--' },
    { name: 'Akşam', time: '--:--' },
    { name: 'Yatsı', time: '--:--' },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Başlatılıyor...');

  // Bir sonraki vakit hesapla
  const calculateNextPrayer = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Bugünün vakitlerini kontrol et
    for (let i = 0; i < prayerTimes.length; i++) {
      const timeStr = prayerTimes[i].time;
      if (!timeStr || timeStr === '--:--') continue;
      
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) continue;
      
      const prayerMinutes = hours * 60 + minutes;

      if (currentMinutes < prayerMinutes) {
        setNextPrayer(i);
        const diff = prayerMinutes - currentMinutes;
        const diffHours = Math.floor(diff / 60);
        const diffMinutes = diff % 60;
        
        if (diffHours > 0) {
          setRemainingTime(`${diffHours} saat ${diffMinutes} dakika`);
        } else {
          setRemainingTime(`${diffMinutes} dakika`);
        }
        return;
      }
    }

    // Tüm vakitler geçtiyse, yarının ilk vaktini göster
    const firstTimeStr = prayerTimes[0].time;
    if (firstTimeStr && firstTimeStr !== '--:--') {
      const [hours, minutes] = firstTimeStr.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const tomorrowPrayerMinutes = hours * 60 + minutes;
        const minutesUntilMidnight = (24 * 60) - currentMinutes;
        const totalMinutesUntilPrayer = minutesUntilMidnight + tomorrowPrayerMinutes;
        const diffHours = Math.floor(totalMinutesUntilPrayer / 60);
        const diffMinutes = totalMinutesUntilPrayer % 60;
        setRemainingTime(`${diffHours} saat ${diffMinutes} dakika`);
      } else {
        setRemainingTime('--:--');
      }
    }
    
    setNextPrayer(0);
  };

  useEffect(() => {
    // Tarih formatla
    const formatDate = () => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      };
      const formattedDate = date.toLocaleDateString('tr-TR', options);
      setCurrentDate(formattedDate);
    };

    // Konum al ve namaz vakitlerini çek
    const getLocationAndPrayerTimes = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('Konum izni kontrol ediliyor...');
        
        // Önce mevcut izin durumunu kontrol et
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
        let finalStatus = existingStatus;
        
        // İzin yoksa iste
        if (existingStatus !== 'granted') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('⚠️ Konum izni yok, son cache kullanılacak');
          setLoadingMessage('Son kaydedilen vakitler yükleniyor...');
          setLocation('Konum izni yok');
          
          // İzin yoksa son cache'i kullan (city = null)
          const times = await getTodayPrayerTimes(null);
          if (times) {
            setPrayerTimes([
              { name: 'İmsak', time: times.imsak },
              { name: 'Güneş', time: times.gunes },
              { name: 'Öğle', time: times.ogle },
              { name: 'İkindi', time: times.ikindi },
              { name: 'Akşam', time: times.aksam },
              { name: 'Yatsı', time: times.yatsi },
            ]);
          } else {
            // Hiç cache yoksa varsayılan şehir kullan
            setLocation('Varsayılan: Istanbul');
            const defaultTimes = await getTodayPrayerTimes('Istanbul');
            if (defaultTimes) {
              setPrayerTimes([
                { name: 'İmsak', time: defaultTimes.imsak },
                { name: 'Güneş', time: defaultTimes.gunes },
                { name: 'Öğle', time: defaultTimes.ogle },
                { name: 'İkindi', time: defaultTimes.ikindi },
                { name: 'Akşam', time: defaultTimes.aksam },
                { name: 'Yatsı', time: defaultTimes.yatsi },
              ]);
            }
          }
          setIsLoading(false);
          return;
        }

        console.log('📍 Konum alınıyor...');
        setLoadingMessage('Konum bilgisi alınıyor...');
        // Android için daha uzun timeout (15 saniye)
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Android için daha uygun
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Konum timeout')), 15000)
        );
        
        const location = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;

        console.log('✅ Konum alındı:', location.coords);

        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        console.log('📍 Adres:', address);

        let cityName = 'Istanbul'; // Varsayılan şehir
        
        if (address && address.city) {
          const displayLocation = `${address.district || address.city || 'Bilinmeyen'}, ${address.city}`;
          setLocation(displayLocation);
          
          // Şehir adını al
          cityName = getCityFromCoordinates(
            location.coords.latitude,
            location.coords.longitude,
            address.city || undefined
          );
        } else {
          setLocation('Istanbul, Türkiye (Varsayılan)');
        }

        console.log('🕌 Vakitler çekiliyor, şehir:', cityName);
        setLoadingMessage('Namaz vakitleri alınıyor...');

        // 🧠 AKILLI SİSTEM: Şehir aynıysa cache'den, değiştiyse API'den al
        const result = await getSmartPrayerTimes(cityName);
        
        if (result.fromCache) {
          console.log('🎉 Vakitler CACHE\'den alındı - API çağrısı YAPILMADI');
        } else {
          console.log('🌐 Vakitler API\'den alındı');
          if (result.cityChanged) {
            console.log('🔄 Şehir değiştiği için yeni vakitler çekildi');
          }
        }
        
        if (result.times) {
          setPrayerTimes([
            { name: 'İmsak', time: result.times.imsak },
            { name: 'Güneş', time: result.times.gunes },
            { name: 'Öğle', time: result.times.ogle },
            { name: 'İkindi', time: result.times.ikindi },
            { name: 'Akşam', time: result.times.aksam },
            { name: 'Yatsı', time: result.times.yatsi },
          ]);
          
          // Arka planda gelecek ayın vakitlerini önceden yükle (sadece API'den çektiyse)
          if (!result.fromCache) {
            preloadNextMonth(cityName).catch((err: Error) => 
              console.log('Gelecek ay yükleme hatası:', err.message)
            );
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Konum ve vakitler alınamadı:', error);
        setLoadingMessage('Son kaydedilen vakitler yükleniyor...');
        
        // Hata durumunda önce son cache'i dene
        try {
          const cachedTimes = await getTodayPrayerTimes(null);
          if (cachedTimes) {
            setLocation('Konum alınamadı (Cache kullanılıyor)');
            setPrayerTimes([
              { name: 'İmsak', time: cachedTimes.imsak },
              { name: 'Güneş', time: cachedTimes.gunes },
              { name: 'Öğle', time: cachedTimes.ogle },
              { name: 'İkindi', time: cachedTimes.ikindi },
              { name: 'Akşam', time: cachedTimes.aksam },
              { name: 'Yatsı', time: cachedTimes.yatsi },
            ]);
          } else {
            // Cache de yoksa varsayılan şehir
            setLocation('Istanbul, Türkiye (Varsayılan)');
            const times = await getTodayPrayerTimes('Istanbul');
            if (times) {
              setPrayerTimes([
                { name: 'İmsak', time: times.imsak },
                { name: 'Güneş', time: times.gunes },
                { name: 'Öğle', time: times.ogle },
                { name: 'İkindi', time: times.ikindi },
                { name: 'Akşam', time: times.aksam },
                { name: 'Yatsı', time: times.yatsi },
              ]);
            }
          }
        } catch (fallbackError) {
          console.error('❌ Fallback vakitler de alınamadı:', fallbackError);
        }
        
        setIsLoading(false);
      }
    };

    formatDate();
    getLocationAndPrayerTimes();
  }, []);

  useEffect(() => {
    // Prayer times yüklendiğinde hesapla
    if (prayerTimes[0].time !== '--:--') {
      calculateNextPrayer();
      
      // Her dakika güncelle
      const interval = setInterval(calculateNextPrayer, 60000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  return (
    <ImageBackground
      source={require('../../assets/images/backgroundImg.png')}
      style={styles.background}
      resizeMode="cover"
      fadeDuration={0}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          {/* Header - Tarih ve Konum */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Ionicons name="calendar-outline" size={20} color="#FFD700" />
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.headerBottom}>
              <Ionicons name="location" size={20} color="#FFD700" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>

          {/* Bir Sonraki Vakit */}
          <View style={styles.nextPrayerSection}>
            <NextPrayerCard
              name={prayerTimes[nextPrayer].name}
              time={prayerTimes[nextPrayer].time}
              remainingTime={remainingTime}
            />
          </View>

          {/* Tüm Vakitler */}
          <View style={styles.allPrayersSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={24} color="#FFD700" />
              <Text style={styles.sectionTitle}>Namaz Vakitleri</Text>
            </View>
            {prayerTimes.map((prayer, index) => (
              <PrayerCard
                key={prayer.name}
                name={prayer.name}
                time={prayer.time}
                isNext={index === nextPrayer}
              />
            ))}
          </View>

          {/* Alt boşluk (Tab bar için) */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    padding: 20,
  },
  headerGradient: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    marginVertical: 12,
    marginHorizontal: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextPrayerSection: {
    marginVertical: 10,
  },
  allPrayersSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bottomSpacer: {
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
