import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PRAYERS } from '../src/data/prayers';

export default function DuaDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const prayer = PRAYERS.find((p) => p.id === id);

  if (!prayer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Dua bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/backgroundImg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close-circle" size={32} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dua Detayı</Text>
          <View style={{ width: 32 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>{prayer.title}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.label}>Okunuşu:</Text>
            <Text style={styles.text}>{prayer.content}</Text>
            
            {prayer.meaning && (
              <>
                <View style={styles.divider} />
                <Text style={styles.label}>Anlamı:</Text>
                <Text style={styles.meaning}>{prayer.meaning}</Text>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 8,
  },
  meaning: {
    fontSize: 16,
    color: '#DDDDDD',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});
