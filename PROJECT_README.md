# Namaz Vakti ve Kıble Uygulaması

React Native (Expo) ve TypeScript ile geliştirilmiş modern bir namaz vakti ve kıble pusulası uygulaması.

## 🚀 Özellikler

- **Ana Sayfa**: Glassmorphism tasarımlı namaz vakitleri listesi
- **Kıble Pusulası**: Gerçek zamanlı pusula ile Kabe yönü gösterimi
- **Ayarlar**: Ezan sesi, bildirim ve ses seviyesi ayarları
- **Modern Tasarım**: Şeffaf tab bar ve glassmorphism efektleri
- **Konum Bazlı**: Otomatik konum algılama

## 📋 Gereksinimler

- Node.js 16+
- Expo CLI
- iOS Simulator / Android Emulator veya fiziksel cihaz

## 🛠️ Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Görselleri ekleyin:
`/assets` klasörüne aşağıdaki görselleri ekleyin:
- `backgroundImg.png` (Ana sayfa arka planı)
- `kabeNight.png` (Pusula sayfası arka planı)

Detaylı bilgi için: `/assets/README.md`

3. Uygulamayı başlatın:
```bash
npx expo start
```

## 📱 Çalıştırma

- iOS Simulator: `i` tuşuna basın
- Android Emulator: `a` tuşuna basın
- Fiziksel Cihaz: Expo Go uygulaması ile QR kodu tarayın

## 📂 Proje Yapısı

```
/src
  /screens
    HomeScreen.tsx          # Ana sayfa
    CompassScreen.tsx       # Kıble pusulası
    SettingsScreen.tsx      # Ayarlar sayfası
  /components
    PrayerCard.tsx          # Namaz vakti kartı
    NextPrayerCard.tsx      # Bir sonraki vakit kartı
  /hooks
    useCompass.ts           # Pusula ve konum hook'u
/assets
  backgroundImg.png         # Ana sayfa arka planı
  kabeNight.png            # Pusula arka planı
App.tsx                     # Ana navigasyon
```

## 🔧 Teknolojiler

- **React Native** (Expo SDK 54+)
- **TypeScript**
- **React Navigation v7** (Bottom Tabs)
- **expo-location** (Konum servisleri)
- **expo-sensors** (Magnetometer)
- **expo-blur** (Glassmorphism efektleri)
- **@react-native-community/slider** (Ses seviyesi kontrolü)

## ⚠️ Önemli Notlar

- Uygulama fiziksel cihazda test edilmelidir (Magnetometer simülatörde çalışmaz)
- Konum izinleri gereklidir
- iOS için: Info.plist'te konum izin açıklamaları eklenmiştir
- Android için: Manifest'te konum izinleri eklenmiştir

## 📝 Lisans

MIT License
