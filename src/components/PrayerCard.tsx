import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PrayerCardProps {
  name: string;
  time: string;
  isNext?: boolean;
}

const getPrayerIcon = (name: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (name) {
    case 'İmsak':
      return 'weather-sunset-up';
    case 'Güneş':
      return 'white-balance-sunny';
    case 'Öğle':
      return 'weather-sunny';
    case 'İkindi':
      return 'weather-sunset-down';
    case 'Akşam':
      return 'weather-night';
    case 'Yatsı':
      return 'moon-waning-crescent';
    default:
      return 'clock-outline';
  }
};

export const PrayerCard: React.FC<PrayerCardProps> = ({ name, time, isNext = false }) => {
  return (
    <View style={[styles.container, isNext && styles.nextContainer]}>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, isNext && styles.nextIconContainer]}>
            <MaterialCommunityIcons 
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
              <MaterialCommunityIcons name="bell-ring" size={12} color="#FFD700" />
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
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  nextContainer: {
    backgroundColor: 'rgba(40, 30, 0, 0.85)',
    borderColor: 'rgba(255, 215, 0, 0.7)',
    borderWidth: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextIconContainer: {
    backgroundColor: 'rgba(60, 45, 0, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  nextText: {
    fontSize: 19,
    color: '#FFF000',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  nextTime: {
    fontSize: 20,
    color: '#FFF000',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
