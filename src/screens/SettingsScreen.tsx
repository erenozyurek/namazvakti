import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
  Alert, Platform, SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { cleanOldCache, clearPrayerCache, getCacheStats } from '../services/cacheManager';
import { getUserLocation, saveUserLocation, UserLocation } from '../services/locationService';
import { getTodayPrayerTimes } from '../services/prayerService';
import { EzanType, getEzanSelection, saveEzanSelection } from '../services/settingsService';

  export const SettingsScreen: React.FC = () => {
    const [ezanEnabled, setEzanEnabled] = useState<boolean>(true);
    const [ezanVolume, setEzanVolume] = useState<number>(70);
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
    const [selectedEzan, setSelectedEzan] = useState<EzanType>('ezan1');
    const [showEzanPicker, setShowEzanPicker] = useState<boolean>(false);
    const [cacheStats, setCacheStats] = useState({ totalItems: 0, totalSize: '0 KB', cities: [] as string[] });
    const [persistentNotificationEnabled, setPersistentNotificationEnabled] = useState<boolean>(false);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [locationLoading, setLocationLoading] = useState<boolean>(false);

    const ezanOptions: { key: EzanType; label: string }[] = [
      { key: 'ezan1', label: 'Ezan 1' },
      { key: 'ezan2', label: 'Ezan 2' },
    ];

    useEffect(() => {
      loadCacheStats();
      loadEzanSelection();
      loadUserLocation();
    }, []);

    const loadUserLocation = async () => {
      const loc = await getUserLocation();
      setUserLocation(loc);
    };

    const handleSetLocation = async () => {
      setLocationLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Konum izni verilmedi!');
          setLocationLoading(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 15000, // 15 saniye timeout
        });
        const locationObj: UserLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        await saveUserLocation(locationObj);
        setUserLocation(locationObj);
      } catch (e) {
        alert('Konum alınamadı: ' + (e as Error).message);
      }
      setLocationLoading(false);
    };

    useEffect(() => {
      if (Platform.OS === 'android') {
        if (persistentNotificationEnabled) {
          startPersistentNotification();
        } else {
          stopPersistentNotification();
        }
      }
    }, [persistentNotificationEnabled]);

    // Kalıcı ezan bildirimi başlat
    const startPersistentNotification = async () => {
      try {
        // Konum ve bugünün tarihini al
        // Örnek: İstanbul ve bugünün tarihi
        const city = 'Istanbul';
        const today = new Date();
        const prayerTimes = await getTodayPrayerTimes(city);
        if (!prayerTimes) throw new Error('Vakitler alınamadı');

        // Vakitleri stringe çevir
        const vakitler = Object.entries(prayerTimes)
          .map(([name, time]) => `${name}: ${time}`)
          .join(' | ');

        // Bir sonraki vakti bul
        const now = today.getHours() * 60 + today.getMinutes();
        let nextName = '';
        let nextTime = '';
        for (const [name, time] of Object.entries(prayerTimes)) {
          const [h, m] = time.split(':').map(Number);
          const vakitDakika = h * 60 + m;
          if (vakitDakika > now) {
            nextName = name;
            nextTime = time;
            break;
          }
        }
        if (!nextName) {
          nextName = 'Yarın';
          nextTime = Object.values(prayerTimes)[0];
        }

        const body = `Bir sonraki vakit: ${nextName} (${nextTime})\n${vakitler}`;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Namaz Vakitleri',
            body,
            sticky: true,
          },
          trigger: null,
        });
      } catch (e) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Namaz Vakitleri',
            body: 'Vakitler alınamadı',
            sticky: true,
          },
          trigger: null,
        });
      }
    };

    // Kalıcı ezan bildirimi durdur
    const stopPersistentNotification = async () => {
      await Notifications.dismissAllNotificationsAsync();
    };

    const loadCacheStats = async () => {
      const stats = await getCacheStats();
      setCacheStats(stats);
    };

    const loadEzanSelection = async () => {
      const ezan = await getEzanSelection();
      setSelectedEzan(ezan);
    };

    const handleEzanSelect = async (key: EzanType) => {
      setSelectedEzan(key);
      await saveEzanSelection(key);
      setShowEzanPicker(false);
    };

    const handleClearCache = async () => {
      Alert.alert(
        'Cache Temizle',
        'Tüm kaydedilmiş namaz vakitleri silinecek. Emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Temizle',
            style: 'destructive',
            onPress: async () => {
              await clearPrayerCache();
              await loadCacheStats();
              Alert.alert('Başarılı', 'Cache temizlendi');
            },
          },
        ]
      );
    };

    const handleCleanOldCache = async () => {
      const deleted = await cleanOldCache();
      await loadCacheStats();
      Alert.alert('Başarılı', `${deleted} eski kayıt silindi`);
    };

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Başlık */}
            <View style={styles.header}>
              <Text style={styles.title}>Ayarlar</Text>
            </View>

            {/* Ezan Okunsun mu */}
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="volume-high" size={24} color="#FFFFFF" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Ezan Okunsun mu?</Text>
                    <Text style={styles.settingDescription}>
                      Vakit girdiğinde ezan sesi çalınsın
                    </Text>
                  </View>
                </View>
                <Switch
                  value={ezanEnabled}
                  onValueChange={setEzanEnabled}
                  trackColor={{ false: '#3e3e3e', true: '#FFD700' }}
                  thumbColor={ezanEnabled ? '#FFFFFF' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            </View>

            {/* Ezan Seçimi */}
            <View style={styles.settingCard}>
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => setShowEzanPicker(!showEzanPicker)}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="musical-note" size={24} color="#FFFFFF" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Ezan Sesi Seçimi</Text>
                    <Text style={styles.settingDescription}>
                      Ezan sesini seçin
                    </Text>
                  </View>
                </View>
                <View style={styles.pickerValue}>
                  <Text style={styles.pickerValueText}>{ezanOptions.find(opt => opt.key === selectedEzan)?.label}</Text>
                  <Ionicons 
                    name={showEzanPicker ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#8E8E93" 
                  />
                </View>
              </TouchableOpacity>
              {showEzanPicker && (
                <View style={styles.ezanPickerList}>
                  {ezanOptions.map(opt => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.ezanPickerItem, selectedEzan === opt.key && styles.ezanPickerItemSelected]}
                      onPress={() => handleEzanSelect(opt.key)}
                    >
                      <Text style={[styles.ezanPickerText, selectedEzan === opt.key && styles.ezanPickerTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Ezan Sesi Seviyesi */}
            <View style={styles.settingCard}>
              <View style={styles.settingColumn}>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Ionicons name="musical-notes" size={24} color="#FFFFFF" />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>Ezan Sesi Seviyesi</Text>
                      <Text style={styles.settingDescription}>
                        Ses yüksekliğini ayarlayın
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.volumeValue}>{Math.round(ezanVolume)}%</Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={ezanVolume}
                    onValueChange={setEzanVolume}
                    minimumTrackTintColor="#FFD700"
                    maximumTrackTintColor="#3e3e3e"
                    thumbTintColor="#FFFFFF"
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>0</Text>
                    <Text style={styles.sliderLabel}>100</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bildirimler */}
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications" size={24} color="#FFFFFF" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Bildirimler</Text>
                    <Text style={styles.settingDescription}>
                      Namaz vakti bildirimleri alın
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#3e3e3e', true: '#FFD700' }}
                  thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            </View>

            {/* Kalıcı Ezan Bildirimi (Android) */}
                        {/* Konum Bilgisi */}
                        <View style={styles.settingCard}>
                          <View style={styles.settingRow}>
                            <View style={styles.settingLeft}>
                              <Ionicons name="location" size={24} color="#FFD700" />
                              <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Konum Bilgisi</Text>
                                <Text style={styles.settingDescription}>
                                  Namaz vakitleri için kullanılan konum
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={handleSetLocation}
                              disabled={locationLoading}
                            >
                              <Text style={styles.actionButtonText}>{locationLoading ? 'Alınıyor...' : 'Konumu Değiştir'}</Text>
                            </TouchableOpacity>
                          </View>
                          {userLocation && (
                            <View style={{ marginTop: 12 }}>
                              <Text style={{ color: '#FFD700', fontSize: 14 }}>
                                Enlem: {userLocation.latitude.toFixed(4)}
                              </Text>
                              <Text style={{ color: '#FFD700', fontSize: 14 }}>
                                Boylam: {userLocation.longitude.toFixed(4)}
                              </Text>
                            </View>
                          )}
                        </View>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications" size={24} color="#FFD700" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Kalıcı Ezan Bildirimi</Text>
                    <Text style={styles.settingDescription}>
                      Ezan vakitleri ve yaklaşan vakit bildirim çubuğunda sürekli görünsün (Android)
                    </Text>
                  </View>
                </View>
                <Switch
                  value={persistentNotificationEnabled}
                  onValueChange={setPersistentNotificationEnabled}
                  trackColor={{ false: '#3e3e3e', true: '#FFD700' }}
                  thumbColor={persistentNotificationEnabled ? '#FFD700' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            </View>

            {/* Cache Yönetimi Bölümü */}
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionDividerText}>VERİ YÖNETİMİ</Text>
            </View>

            {/* Cache İstatistikleri */}
            <View style={styles.settingCard}>
              <View style={styles.settingColumn}>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Ionicons name="server-outline" size={24} color="#FFD700" />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>Önbellek İstatistikleri</Text>
                      <Text style={styles.settingDescription}>
                        Kaydedilmiş vakitler
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cacheInfo}>
                  <View style={styles.cacheInfoRow}>
                    <Text style={styles.cacheInfoLabel}>Kayıtlı Aylar:</Text>
                    <Text style={styles.cacheInfoValue}>{cacheStats.totalItems}</Text>
                  </View>
                  <View style={styles.cacheInfoRow}>
                    <Text style={styles.cacheInfoLabel}>Toplam Boyut:</Text>
                    <Text style={styles.cacheInfoValue}>{cacheStats.totalSize}</Text>
                  </View>
                  {cacheStats.cities.length > 0 && (
                    <View style={styles.cacheInfoRow}>
                      <Text style={styles.cacheInfoLabel}>Şehirler:</Text>
                      <Text style={styles.cacheInfoValue}>{cacheStats.cities.join(', ')}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Cache Temizleme Butonları */}
            <View style={styles.settingCard}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCleanOldCache}>
                <Ionicons name="trash-outline" size={20} color="#FFD700" />
                <Text style={styles.actionButtonText}>Eski Kayıtları Temizle</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingCard}>
              <TouchableOpacity style={styles.actionButtonDanger} onPress={handleClearCache}>
                <Ionicons name="trash" size={20} color="#FF6B6B" />
                <Text style={styles.actionButtonTextDanger}>Tüm Önbelleği Temizle</Text>
              </TouchableOpacity>
            </View>

            {/* Uygulama Bilgisi */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>Namaz Vakti ve Kıble</Text>
              <Text style={styles.versionText}>Versiyon 1.0.0</Text>
              <Text style={styles.infoDescription}>
                Vakitler aylık olarak kaydedilir ve offline çalışır
              </Text>
            </View>

            {/* Alt boşluk (Tab bar için) */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  };


const styles = StyleSheet.create({
    ezanPickerList: {
      marginTop: 8,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.03)',
      paddingVertical: 4,
    },
    ezanPickerItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginVertical: 2,
      backgroundColor: 'rgba(255,255,255,0.05)',
    },
    ezanPickerItemSelected: {
      backgroundColor: 'rgba(255,215,0,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255,215,0,0.3)',
    },
    ezanPickerText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    ezanPickerTextSelected: {
      color: '#FFD700',
    },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingColumn: {
    flexDirection: 'column',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  volumeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 12,
  },
  sliderContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  infoSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  sectionDivider: {
    marginVertical: 20,
    alignItems: 'center',
  },
  sectionDividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1.5,
  },
  cacheInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cacheInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cacheInfoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  cacheInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  actionButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  actionButtonTextDanger: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  pickerValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  pickerContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pickerOptionTextSelected: {
    color: '#FFD700',
  },
  bottomSpacer: {
    height: 100,
  },
});
