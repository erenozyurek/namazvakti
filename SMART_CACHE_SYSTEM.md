# 🎯 Akıllı Cache Sistemi - Konum Tabanlı Namaz Vakitleri

## 📋 Genel Bakış

Namaz vakitleri uygulaması artık **akıllı cache sistemi** ile çalışıyor. Kullanıcının konum durumuna göre otomatik olarak en güncel veya en son kaydedilen vakitleri gösterir.

---

## 🔄 Sistem Mantığı

### 1. **Konum İzni AÇIK** → Fresh Data + Cache
- ✅ Kullanıcının konumu alınır
- ✅ API'den güncel namaz vakitleri çekilir
- ✅ Veriler otomatik olarak cache'e kaydedilir
- ✅ Bir önceki cache **SİLİNMEZ** (yedek olarak saklanır)

### 2. **Konum İzni KAPALI** → Son Cache
- ⚠️ Konum alınamaz
- 📦 Son kaydedilen cache'deki vakitler gösterilir
- 🕒 Cache ne kadar eski olursa olsun kullanılır
- ℹ️ Ekranda "Konum izni yok (Cache kullanılıyor)" mesajı görünür

### 3. **Hata Durumu** → Fallback Stratejisi
- ❌ API veya konum hatası oluşursa
- 📦 Önce son cache denenir
- 🌍 Cache de yoksa varsayılan şehir (Istanbul) kullanılır

---

## 🗂️ Cache Anahtarları

```typescript
// Haftalık cache (Pazartesi-Pazar döngüsü)
WEEKLY_CACHE_KEY_PREFIX = 'weekly_prayer_times_'

// Aylık cache (fallback)
CACHE_KEY_PREFIX = 'prayer_times_'

// SON YEDEK CACHE (akıllı sistem)
LAST_PRAYER_CACHE_KEY = 'last_prayer_times_backup'
LAST_CITY_CACHE_KEY = 'last_city_used'
```

---

## 📦 Cache Yapısı

### Son Yedek Cache Formatı:
```json
{
  "city": "Istanbul",
  "data": {
    "imsak": "05:30",
    "gunes": "07:15",
    "ogle": "13:05",
    "ikindi": "15:45",
    "aksam": "18:20",
    "yatsi": "19:50"
  },
  "cachedAt": 1705237200000
}
```

---

## 🛠️ Fonksiyon Detayları

### `saveLastPrayerCache(city, data)`
- **Amaç:** API'den gelen veriyi yedek olarak kaydetmek
- **Ne Zaman Çalışır:** Her başarılı API çağrısından sonra
- **Kayıt:** 
  - `LAST_PRAYER_CACHE_KEY` → Namaz vakitleri
  - `LAST_CITY_CACHE_KEY` → Kullanılan şehir adı
- **Eski Cache:** Üzerine yazılır (ama silinmez, AsyncStorage'da kalır)

### `getLastPrayerCache()`
- **Amaç:** Konum yokken son kaydedilen vakitleri almak
- **Dönüş:** `{ city, data, cachedAt }` veya `null`
- **Cache Yaşı:** Sınır yok - ne kadar eski olursa olsun kullanılır
- **Log:** "📦 Son yedek cache: Istanbul (12 saat önce)"

### `getTodayPrayerTimes(city | null)`
- **Parametre:** 
  - `city` → Konum varsa şehir adı
  - `null` → Konum yoksa null gönder
- **Mantık:**
  ```typescript
  if (!city) {
    // Konum yok → Son cache'i kullan
    return getLastPrayerCache()
  } else {
    // Konum var → API'den çek + cache'e kaydet
    const apiData = await fetchFromAPI(city)
    await saveLastPrayerCache(city, apiData)
    return apiData
  }
  ```

### `getTodayFromWeeklyTimes(city | null, country)`
- **Haftalık Veri:** Pazartesi-Pazar için 7 günlük vakitler
- **Fallback:** API başarısız olursa son cache kullanılır
- **Cache Yaşlandırma:** Her yeni haftada cache otomatik yenilenir

---

## 🎨 Kullanıcı Arayüzü Durumları

| Durum | Ekran Mesajı | Veri Kaynağı |
|-------|-------------|-------------|
| ✅ Konum izni var | "Ankara, Türkiye" | API + Fresh Cache |
| ⚠️ Konum izni yok | "Konum izni yok" | Son Yedek Cache |
| ❌ Konum hatası | "Konum alınamadı (Cache kullanılıyor)" | Son Yedek Cache |
| ❌ API hatası | "Istanbul, Türkiye (Varsayılan)" | Varsayılan Şehir API |
| ❌ Hiçbir şey yok | "--:--" | Boş |

---

## 📝 Log Sistemi

Sistem her adımda detaylı loglar üretir:

```typescript
// Konum kontrolü
console.log('⚠️ Konum bilgisi yok, son cache kullanılıyor')
console.log('📍 Konum alınıyor...')
console.log('✅ Konum alındı:', coords)

// Cache işlemleri
console.log('✅ Son vakitler yedeklendi:', city)
console.log('📦 Son yedek cache: Istanbul (5 saat önce)')
console.log('✅ Bugünün vakitleri CACHE\'den alındı')

// API çağrıları
console.log('🕌 Vakitler çekiliyor, şehir:', city)
console.log('✅ API yanıtı:', times)
console.log('❌ API hatası:', error)
```

---

## 🚀 Kullanım Senaryoları

### Senaryo 1: İlk Kullanım (Konum İzni Verildi)
1. Uygulama açılır
2. Konum izni istenir → KABUL EDİLİR
3. GPS'den konum alınır → "Ankara"
4. API'den Ankara'nın vakitleri çekilir
5. Veriler cache'e kaydedilir ✅
6. Ekranda "Ankara, Türkiye" görünür

### Senaryo 2: Konum İzni Kapatıldı
1. Kullanıcı ayarlardan konum iznini KAPATIYOR
2. Uygulama tekrar açılır
3. Konum izni kontrol edilir → YOK
4. Son cache'den vakitler alınır → "Ankara, 5 saat önce"
5. Ekranda "Konum izni yok" görünür
6. Ama vakitler Ankara'nın eskisi gösterilir ✅

### Senaryo 3: İnternet Yok + Konum Var
1. Kullanıcı uçak moduna geçiyor
2. Uygulama açılır
3. Konum alınır → "Istanbul"
4. API çağrısı BAŞARISIZ (internet yok)
5. Son cache'den vakitler alınır → "Istanbul, 2 gün önce"
6. Ekranda "Konum alınamadı (Cache kullanılıyor)" görünür

### Senaryo 4: Seyahat Durumu
1. Kullanıcı Ankara'da → Cache: Ankara vakitleri
2. Istanbul'a seyahat eder
3. Uygulama açılır
4. Konum alınır → "Istanbul"
5. API'den Istanbul vakitleri çekilir
6. YENİ cache kaydedilir → "Istanbul"
7. ESKİ cache SİLİNMEZ (yedek olarak kalır)

---

## ⚡ Performans Optimizasyonları

1. **Haftalık Cache:** 7 günlük veri bir kerede çekilir (API çağrısı azalır)
2. **Aylık Fallback:** Haftalık cache yoksa aylık veriye düşülür
3. **Preloading:** Gelecek ayın vakitleri arka planda önceden yüklenir
4. **AsyncStorage:** Tüm cache işlemleri yerel depolamada (hızlı)
5. **MultiSet:** Birden fazla cache anahtarı tek seferde yazılır

---

## 🔧 Teknik Detaylar

### API Parametreleri
```typescript
// Diyanet İşleri Başkanlığı uyumlu
method=13

// ISO 8601 tarih formatı
date: "2024-01-15" // YYYY-MM-DD
```

### TypeScript Tipleri
```typescript
interface PrayerTimesResponse {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
}

interface CachedBackup {
  city: string;
  data: PrayerTimesResponse;
  cachedAt: number; // Unix timestamp
}
```

---

## 🎯 Avantajlar

✅ **Çevrimdışı Çalışma:** İnternet olmasa bile son vakitler gösterilir  
✅ **Konum Gizliliği:** Kullanıcı konum kapatsa bile uygulama çalışır  
✅ **Hızlı Yükleme:** Cache'den okuma çok hızlı (API'ye bağlı değil)  
✅ **Güvenilir Fallback:** Tüm hata durumları için yedek plan var  
✅ **Akıllı Güncelleme:** Konum açıldığında otomatik yeni veri çekilir  
✅ **Seyahat Desteği:** Farklı şehirlere gidince otomatik adapte olur  

---

## 📅 Cache Yaşlandırma Politikası

- **Haftalık Cache:** Her Pazartesi otomatik yenilenir
- **Aylık Cache:** Her ay başı otomatik yenilenir
- **Son Yedek Cache:** HER API ÇAĞRISINDA güncellenir
- **Eski Cache'ler:** SİLİNMEZ, AsyncStorage limitine ulaşana kadar kalır

---

## 🐛 Hata Ayıklama

### Log Seviyeleri:
- `📍` → Konum işlemleri
- `🕌` → API çağrıları
- `📦` → Cache işlemleri
- `✅` → Başarılı işlemler
- `⚠️` → Uyarılar
- `❌` → Hatalar

### Örnek Console Çıktısı:
```
📅 Bugün: 2024/1/15 - Şehir: Ankara
📍 Konum alınıyor...
✅ Konum alındı: {latitude: 39.9334, longitude: 32.8597}
🕌 Vakitler çekiliyor, şehir: Ankara
✅ API yanıtı: {imsak: '05:30', gunes: '07:15', ...}
✅ Son vakitler yedeklendi: Ankara
✅ Bugünün vakitleri CACHE'den alındı
```

---

## 🔄 Sistem Akış Diyagramı

```
Uygulama Açılış
    ↓
Konum İzni Kontrol
    ↓
┌─────────┴─────────┐
│                   │
✅ İzin Var        ❌ İzin Yok
│                   │
Konum Al            Son Cache Al
│                   │
API Çağır           Ekranda Göster
│                   │
Cache Kaydet        ↓
│                   (Bitti)
Ekranda Göster
│
(Bitti)
```

---

## 📞 İletişim & Destek

Bu sistem ile ilgili sorular için:
- GitHub Issues
- Dokümantasyon güncellemeleri
- Log çıktılarını inceleyin

**Son Güncelleme:** 2024-01-15  
**Versiyon:** 1.0.0  
**Geliştirici:** Namaz Vakti Uygulaması Ekibi
