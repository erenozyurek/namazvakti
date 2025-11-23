import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NextPrayerCardProps {
  name: string;
  time: string;
  remainingTime: string;
}

export const NextPrayerCard: React.FC<NextPrayerCardProps> = ({ name, time, remainingTime }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.labelContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.label}>Bir Sonraki Vakit</Text>
        </View>
        
        <View style={styles.mainContent}>
          <Ionicons name="moon" size={40} color="#FFD700" style={styles.prayerIcon} />
          <Text style={styles.prayerName}>{name}</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Ionicons name="time" size={32} color="#FFFFFF" />
          <Text style={styles.prayerTime}>{time}</Text>
        </View>
        
        <View style={styles.remainingContainer}>
          <Ionicons name="hourglass-outline" size={18} color="#FFD700" />
          <Text style={styles.remainingText}>{remainingTime}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    overflow: 'hidden',
    marginVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  gradient: {
    padding: 0,
  },
  content: {
    padding: 28,
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  mainContent: {
    alignItems: 'center',
    marginBottom: 8,
  },
  prayerIcon: {
    marginBottom: 8,
  },
  prayerName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  prayerTime: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
});
