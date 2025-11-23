import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PrayerCardProps {
  name: string;
  time: string;
  isNext?: boolean;
}

const getPrayerIcon = (name: string): keyof typeof Ionicons.glyphMap => {
  switch (name) {
    case 'İmsak':
      return 'sunny-outline';
    case 'Güneş':
      return 'sunny';
    case 'Öğle':
      return 'partly-sunny-outline';
    case 'İkindi':
      return 'cloudy-outline';
    case 'Akşam':
      return 'moon';
    case 'Yatsı':
      return 'moon-outline';
    default:
      return 'time-outline';
  }
};

export const PrayerCard: React.FC<PrayerCardProps> = ({ name, time, isNext = false }) => {
  return (
    <View style={[styles.container, isNext && styles.nextContainer]}>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, isNext && styles.nextIconContainer]}>
            <Ionicons 
              name={getPrayerIcon(name)} 
              size={24} 
              color={isNext ? '#FFD700' : '#FFFFFF'} 
            />
          </View>
          <Text style={[styles.name, isNext && styles.nextText]}>{name}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={[styles.time, isNext && styles.nextTime]}>{time}</Text>
          {isNext && (
            <View style={styles.activeBadge}>
              <Ionicons name="notifications" size={12} color="#FFD700" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    overflow: 'hidden',
    marginVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextIconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  nextText: {
    fontSize: 19,
    color: '#FFD700',
    fontWeight: '800',
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  nextTime: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '900',
  },
  activeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
