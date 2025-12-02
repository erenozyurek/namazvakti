import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    ImageBackground,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useCompass } from '../hooks/useCompass';
import { getTodayPrayerTimes } from '../services/prayerService';

const getBackgroundImage = (currentTime: Date, prayerTimes: any) => {
  if (!prayerTimes) return require('../../assets/images/kabeNight.png');

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  const imsak = timeToMinutes(prayerTimes.imsak);
  const ogle = timeToMinutes(prayerTimes.ogle);
  const aksam = timeToMinutes(prayerTimes.aksam);

  // Akşam - Gece (Akşam vaktinden İmsak vaktine kadar)
  if (now >= aksam || now < imsak) {
    return require('../../assets/images/kabeNight.png');
  }
  // İmsak - Sabah (İmsak'tan Öğle'ye kadar)
  if (now >= imsak && now < ogle) {
    return require('../../assets/images/kabeMorning.png');
  }
  // Öğle - Akşam (Öğle'den Akşam'a kadar)
  if (now >= ogle && now < aksam) {
    return require('../../assets/images/kabeSunset.png');
  }

  return require('../../assets/images/kabeNight.png');
};

export const CompassScreen: React.FC = () => {
  const { heading, qiblaDirection, userLocation, isLoading, error } = useCompass();
  const compassRotation = useRef(new Animated.Value(0)).current;
  const qiblaRotation = useRef(new Animated.Value(0)).current;
  const [backgroundImage, setBackgroundImage] = useState(require('../../assets/images/kabeNight.png'));
  
  // Kıble'ye ne kadar yakın olduğumuzu hesapla (±1° tolerans)
  const qiblaAngle = qiblaDirection - heading;
  const normalizedAngle = ((qiblaAngle + 180) % 360) - 180; // -180 ile 180 arası
  const isPointingToQibla = Math.abs(normalizedAngle) < 1; // 1 derece tolerans

  // Namaz vakitlerine göre arka plan seç
  useEffect(() => {
    const loadPrayerTimesAndBackground = async () => {
      try {
        const city = await AsyncStorage.getItem('selectedCity') || 'Istanbul';
        const times = await getTodayPrayerTimes(city);
        const image = getBackgroundImage(new Date(), times);
        setBackgroundImage(image);
      } catch (err) {
        console.error('Arka plan seçimi hatası:', err);
      }
    };
    loadPrayerTimesAndBackground();
  }, []);

  // Pusula diskini döndür (cihazın yönüne göre ters yönde)
  useEffect(() => {
    if (!isNaN(heading) && isFinite(heading)) {
      Animated.timing(compassRotation, {
        toValue: -heading,
        duration: 50, // 100ms'den 50ms'ye düşürdük
        useNativeDriver: true,
      }).start();
    }
  }, [heading]);

  // Kıble okunu döndür (Kıble yönüne göre)
  useEffect(() => {
    const qiblaAngle = qiblaDirection - heading;
    
    if (!isNaN(qiblaAngle) && isFinite(qiblaAngle)) {
      // Spring animasyonu yerine direkt setValue kullanalım
      qiblaRotation.setValue(qiblaAngle);
    }
  }, [heading, qiblaDirection]);

  const compassRotationStyle = compassRotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  const qiblaRotationStyle = qiblaRotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  if (isLoading) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
        fadeDuration={0}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Pusula hazırlanıyor...</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
        fadeDuration={0}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
      fadeDuration={0}
    >
      {/* Overlay için siyah katman */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Kıble Pusulası</Text>
          {userLocation && (
            <Text style={styles.locationInfo}>
              {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
            </Text>
          )}
        </View>

        {/* Pusula Alanı */}
        <View style={styles.compassContainer}>
          {/* Sabit Kıble Yazısı (Tepede - Çemberin Dışında) */}
          <Text style={styles.kiblaTitle}>KIBLE</Text>

          {/* Ana Pusula Çemberi (Sabit) */}
          <View style={styles.compassOuter}>
            
            {/* Sabit Disk (Dönmüyor) */}
            <View style={styles.compassInner}>
              {/* Derece çizgileri */}
              {Array.from({ length: 36 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.degreeLine,
                    i % 9 === 0 && styles.degreeLineMajor,
                    { transform: [{ rotate: `${i * 10}deg` }] },
                  ]}
                />
              ))}
            </View>

            {/* Dönen Kıble Oku */}
            <Animated.View
              style={[
                styles.qiblaArrowContainer,
                {
                  transform: [{ rotate: qiblaRotationStyle }],
                  zIndex: 20,
                },
              ]}
            >
              <View style={styles.qiblaArrow}>
                <View style={[
                  styles.arrowHead,
                  isPointingToQibla && styles.arrowHeadGreen
                ]} />
                <View style={[
                  styles.arrowBody,
                  isPointingToQibla && styles.arrowBodyGreen
                ]} />
              </View>
              <Text style={[
                styles.qiblaLabel,
                isPointingToQibla && styles.qiblaLabelActive
              ]}>
                {isPointingToQibla ? 'KIBLE ✓' : 'KIBLE'}
              </Text>
            </Animated.View>

            {/* Merkez Nokta */}
            <View style={styles.centerDot} />
          </View>

          {/* Derece Bilgisi */}
          <View style={styles.infoContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Mevcut Yön</Text>
              <Text style={styles.infoValue}>{Math.round(heading)}°</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Kıble Yönü</Text>
              <Text style={[styles.infoValue, styles.qiblaValue]}>{Math.round(qiblaDirection)}°</Text>
            </View>
          </View>
        </View>

        {/* Alt Bilgi */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Telefonu istediğiniz şekilde tutun{'\n'}
            Yeşil ok yukarı gelene kadar dönün
          </Text>
        </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  locationInfo: {
    fontSize: 12,
    color: '#CCCCCC',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 3,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  kiblaTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 20, // Çemberden uzaklık
    zIndex: 30,
  },
  compassInner: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(20, 20, 30, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  degreeLine: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: 5,
    left: '50%',
    marginLeft: -1,
    transformOrigin: '1px 115px',
  },
  degreeLineMajor: {
    height: 15,
    width: 3,
    backgroundColor: 'rgba(255, 215, 0, 0.6)',
    marginLeft: -1.5,
  },
  qiblaArrowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  qiblaArrow: {
    alignItems: 'center',
    marginTop: -120, // Merkeze yerleştir, yukarı doğru çık
  },
  qiblaLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '800',
    color: '#00FF88',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  arrowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    alignItems: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 70,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF4444', // Varsayılan kırmızı
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  arrowHeadGreen: {
    borderBottomColor: '#00FF88', // Kıble'ye bakarken yeşil
    shadowColor: '#00FF88',
  },
  arrowBody: {
    width: 10,
    height: 65,
    backgroundColor: '#CC0000', // Varsayılan kırmızı
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  arrowBodyGreen: {
    backgroundColor: '#00DD77', // Kıble'ye bakarken yeşil
    shadowColor: '#00FF88',
  },
  qiblaLabelActive: {
    color: '#00FF88',
    fontSize: 12,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    position: 'absolute',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    alignItems: 'center',
    minWidth: 120,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qiblaValue: {
    color: '#00FF88',
  },
  footer: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
