# Namaz Vakti ve Kıble - Kurulum Talimatları

## ✅ Oluşturulan Dosyalar

Aşağıdaki dosyalar başarıyla oluşturuldu:

### Ana Dosyalar
- ✅ `App.tsx` - Ana navigasyon kurulumu
- ✅ `PROJECT_README.md` - Proje dokümantasyonu

### Ekranlar (`/src/screens/`)
- ✅ `HomeScreen.tsx` - Glassmorphism tasarımlı ana sayfa
- ✅ `CompassScreen.tsx` - Animasyonlu kıble pusulası
- ✅ `SettingsScreen.tsx` - Siyah temalı ayarlar sayfası

### Bileşenler (`/src/components/`)
- ✅ `PrayerCard.tsx` - Namaz vakti kartı bileşeni
- ✅ `NextPrayerCard.tsx` - Bir sonraki vakit kartı bileşeni

### Hooks (`/src/hooks/`)
- ✅ `useCompass.ts` - Magnetometer ve konum yönetimi

### Varlıklar
- ✅ `assets/README.md` - Görsel gereksinimleri

## 🖼️ Gerekli Görseller

Uygulamanın çalışması için aşağıdaki görsellere ihtiyacınız var:

1. **backgroundImg.png** (Ana sayfa arka planı)
   - Boyut: En az 1080x1920 piksel
   - Format: PNG
   - İçerik: Namaz/cami temalı görsel

2. **kabeNight.png** (Pusula sayfası arka planı)
   - Boyut: En az 1080x1920 piksel
   - Format: PNG
   - İçerik: Kabe'nin gece fotoğrafı

Bu görselleri `/assets/` klasörüne ekleyin.

### Geçici Çözüm (Görseller Yoksa)

Eğer görselleri henüz hazırlamadıysanız, geçici olarak aşağıdaki değişiklikleri yapabilirsiniz:

**HomeScreen.tsx'te:**
```tsx
// ImageBackground yerine View kullanın
<View style={[styles.background, { backgroundColor: '#1a1a2e' }]}>
```

**CompassScreen.tsx'te:**
```tsx
// ImageBackground yerine View kullanın
<View style={[styles.background, { backgroundColor: '#0f3460' }]}>
```

## 🚀 Uygulamayı Başlatma

1. Terminal'de proje klasörüne gidin:
```bash
cd /Users/erenozyurek/namazvakti
```

2. Uygulamayı başlatın:
```bash
npx expo start
```

3. Seçenekler:
   - iOS: `i` tuşuna basın
   - Android: `a` tuşuna basın
   - Web: `w` tuşuna basın (Pusula web'de çalışmaz)

## ⚠️ Önemli Notlar

### Magnetometer
- Magnetometer sadece **fiziksel cihazlarda** çalışır
- iOS/Android simülatörlerinde pusula özelliği çalışmayacaktır
- Test için gerçek bir telefon kullanın

### İzinler
- İlk açılışta **konum izni** isteyecektir
- İzin vermezseniz konum bazlı özellikler çalışmaz

### package.json
- Ana giriş noktası `expo-router/entry`'den `node_modules/expo/AppEntry.js`'e değiştirildi
- Bu sayede kendi `App.tsx` dosyamız çalışacak

### app.json
- iOS ve Android için konum izinleri eklendi
- İzin açıklamaları Türkçe olarak yazıldı

## 🎨 Özellikler

### Ana Sayfa
- Arka plan görseli ile full-screen tasarım
- Glassmorphism (buzlu cam) efektli kartlar
- Otomatik konum algılama
- Bir sonraki vakit highlight'ı
- Geri sayım sayacı

### Pusula Sayfası
- Gerçek zamanlı magnetometer verisi
- Animasyonlu kıble oku
- Derece göstergesi
- Konum koordinatları
- Koyu temalı, görsel üzerinde şeffaf UI

### Ayarlar Sayfası
- Tamamen siyah arka plan (#000000)
- Beyaz metinler ve ikonlar
- Ezan açma/kapama switch'i
- Ses seviyesi slider'ı (0-100)
- Bildirim ayarı
- Modern kart tasarımı

### Tab Bar
- iOS'ta blur efektli şeffaf tab bar
- Android'de koyu yarı saydam arka plan
- Aktif tab: Altın sarısı (#FFD700)
- Pasif tab: Gri (#8E8E93)
- İkonlar: Ionicons

## 🐛 Sorun Giderme

### Uygulama başlamıyor
```bash
# Cache'i temizleyin
npx expo start -c
```

### Import hataları
```bash
# Node modüllerini yeniden yükleyin
rm -rf node_modules
npm install
```

### TypeScript hataları
- Tüm dosyalar TypeScript ile yazılmıştır
- .tsx uzantılı dosyalar JSX içerir
- .ts uzantılı dosyalar sadece TypeScript içerir

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. `npx expo start -c` ile cache'i temizleyin
2. Görsellerin doğru yolda olduğundan emin olun
3. İzinlerin verildiğini kontrol edin
4. Fiziksel cihazda test edin

## 🎉 Başarılı Kurulum!

Tüm dosyalar hazır! Şimdi görselleri ekleyip uygulamayı test edebilirsiniz.
