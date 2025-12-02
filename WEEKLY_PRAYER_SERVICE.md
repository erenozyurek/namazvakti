# Haftalık Ezan Vakitleri Servisi - Kullanım Kılavuzu

## 📋 Genel Bakış

`prayerService.ts` dosyasına Diyanet uyumlu (method=13) haftalık ezan vakitleri servisi eklendi.

## 🎯 Özellikler

✅ **Akıllı Önbellekleme**: Haftalık veriler cache'lenir, yeni haftaya girilene kadar API'ye tekrar istek atılmaz
✅ **Diyanet Uyumlu**: method=13 parametresi ile Diyanet İşleri Başkanlığı uyumu
✅ **ISO 8601 Format**: Tutarlı tarih formatı
✅ **Hata Yönetimi**: İnternet kesintileri ve API hatalarını yönetir
✅ **Dinamik Lokasyon**: Şehir ve ülke parametreleri dinamik
✅ **Performanslı**: Gereksiz API çağrılarını önler

## 🚀 Fonksiyonlar

### 1. `getWeeklyPrayerTimes(city, country)`

Haftalık (Pazartesi-Pazar) ezan vakitlerini getirir.

```typescript
import { getWeeklyPrayerTimes } from '@/services/prayerService';

// Kullanım
const weeklyTimes = await getWeeklyPrayerTimes('Istanbul', 'Turkey');

// Dönüş formatı
[
  {
    date: "2025-12-01",           // ISO 8601
    gregorian: "01.12.2025",       // Görüntüleme için
    hijri: "30 Cemaziyelahir 1447", // Hicri tarih
    timings: {
      imsak: "05:45",
      gunes: "07:15",
      ogle: "12:30",
      ikindi: "15:00",
      aksam: "17:30",
      yatsi: "19:00"
    }
  },
  // ... 7 gün için
]
```

### 2. `getTodayFromWeeklyTimes(city, country)`

Bugünün ezan vakitlerini haftalık veriden çeker.

```typescript
import { getTodayFromWeeklyTimes } from '@/services/prayerService';

const todayTimes = await getTodayFromWeeklyTimes('Ankara', 'Turkey');

// Dönüş formatı
{
  imsak: "05:45",
  gunes: "07:15",
  ogle: "12:30",
  ikindi: "15:00",
  aksam: "17:30",
  yatsi: "19:00"
}
```

## 💾 Önbellekleme Mantığı

1. **İlk İstek**: API'den haftalık veri çekilir ve cache'lenir
2. **Sonraki İstekler**: Cache'den okunur (hafta boyunca)
3. **Yeni Hafta**: Cache otomatik temizlenir, yeni veriler çekilir

### Cache Anahtarı Formatı
```
weekly_prayer_times_v1_{city}_{country}_{weekStart}
Örnek: weekly_prayer_times_v1_Istanbul_Turkey_2025-12-02
```

## 🔧 Entegrasyon Örnekleri

### React Native Komponente Entegrasyon

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getWeeklyPrayerTimes, WeeklyPrayerTime } from '@/services/prayerService';

export default function WeeklyPrayersScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyPrayerTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyPrayers();
  }, []);

  const loadWeeklyPrayers = async () => {
    try {
      const data = await getWeeklyPrayerTimes('Istanbul', 'Turkey');
      if (data) {
        setWeeklyData(data);
      }
    } catch (error) {
      console.error('Veri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <FlatList
        data={weeklyData}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View>
            <Text>{item.gregorian}</Text>
            <Text>İmsak: {item.timings.imsak}</Text>
            <Text>Güneş: {item.timings.gunes}</Text>
            {/* ... diğer vakitler */}
          </View>
        )}
      />
    </View>
  );
}
```

## 📊 API Detayları

**Endpoint**: `https://api.aladhan.com/v1/calendarByCity/{year}/{month}`

**Parametreler**:
- `city`: Şehir adı (örn: Istanbul, Ankara)
- `country`: Ülke adı (örn: Turkey)
- `method`: 13 (Diyanet İşleri Başkanlığı)
- `iso8601`: true (Tarih formatı)

## ⚠️ Hata Yönetimi

```typescript
const weeklyData = await getWeeklyPrayerTimes('Istanbul', 'Turkey');

if (!weeklyData) {
  // İnternet yok veya API hatası
  console.log('Vakitler yüklenemedi, lütfen tekrar deneyin');
}
```

## 🧪 Test Senaryoları

1. **Normal Kullanım**: İlk istekte API çağrısı, sonraki isteklerde cache
2. **Hafta Değişimi**: Pazartesi günü otomatik yeni hafta verisi çekimi
3. **İnternet Kesintisi**: Graceful hata yönetimi, null döner
4. **Farklı Şehirler**: Her şehir için ayrı cache

## 📝 Notlar

- Cache AsyncStorage kullanır (React Native)
- Hafta Pazartesi-Pazar arası kabul edilir
- Türkçe ay isimleri Hicri tarihte mevcuttur
- Tüm saatler HH:MM formatındadır
