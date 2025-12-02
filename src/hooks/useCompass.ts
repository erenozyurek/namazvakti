import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

interface CompassData {
  heading: number;
  qiblaDirection: number;
  userLocation: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  error: string | null;
  deviceOrientation: 'flat' | 'portrait' | 'landscape' | 'upsidedown';
}

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

export const useCompass = (): CompassData => {
  const [heading, setHeading] = useState<number>(0);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<'flat' | 'portrait' | 'landscape' | 'upsidedown'>('portrait');

  const calculateQiblaDirection = (lat: number, lon: number): number => {
    const latRad = lat * (Math.PI / 180);
    const lonRad = lon * (Math.PI / 180);
    const kaabaLatRad = KAABA_LAT * (Math.PI / 180);
    const kaabaLonRad = KAABA_LON * (Math.PI / 180);

    const dLon = kaabaLonRad - lonRad;

    const y = Math.sin(dLon) * Math.cos(kaabaLatRad);
    const x =
      Math.cos(latRad) * Math.sin(kaabaLatRad) -
      Math.sin(latRad) * Math.cos(kaabaLatRad) * Math.cos(dLon);

    let bearing = Math.atan2(y, x);
    bearing = bearing * (180 / Math.PI);
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  useEffect(() => {
    let headingSubscription: Location.LocationSubscription | null = null;

    const setupCompass = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Konum izni verilmedi');
          setIsLoading(false);
          return;
        }

        // Android için daha uzun timeout (15 saniye)
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Konum timeout')), 15000)
        );
        
        const location = await Promise.race([locationPromise, timeoutPromise]);

        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });

        const qibla = calculateQiblaDirection(latitude, longitude);
        setQiblaDirection(qibla);

        // Sistem pusulasını kullan (Otomatik tilt compensation ve true north)
        headingSubscription = await Location.watchHeadingAsync((headingData) => {
          const { trueHeading, magHeading } = headingData;
          // trueHeading varsa onu kullan (GPS destekli gerçek kuzey), yoksa manyetik kuzey
          const currentHeading = trueHeading >= 0 ? trueHeading : magHeading;
          setHeading(currentHeading);
          
          // Basit bir orientation tahmini (sadece UI için, hesaplama için değil)
          // watchHeadingAsync orientation bilgisini doğrudan vermez, ama pusula zaten kompanse edilmiştir.
          // Varsayılan olarak portrait kabul edebiliriz veya ivmeölçer ekleyip sadece UI için kullanabiliriz.
          // Şimdilik sabit bırakıyoruz çünkü sistem pusulası her açıda doğru çalışır.
          setDeviceOrientation('portrait');
        });

        setIsLoading(false);
      } catch (err) {
        setError('Pusula başlatılamadı');
        setIsLoading(false);
      }
    };

    setupCompass();

    return () => {
      if (headingSubscription) {
        headingSubscription.remove();
      }
    };
  }, []);

  return { heading, qiblaDirection, userLocation, isLoading, error, deviceOrientation };
};
