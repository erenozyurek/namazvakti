import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { CompassScreen } from './src/screens/CompassScreen';
import { DualarScreen } from './src/screens/DualarScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ZikirmatikScreen } from './src/screens/ZikirmatikScreen';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Ana Sayfa"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Ana Sayfa') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Dualar') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Zikirmatik') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Pusula') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'Ayarlar') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView
                intensity={80}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            ) : null
          ),
        })}
      >
        <Tab.Screen
          name="Dualar"
          component={DualarScreen}
          options={{
            tabBarLabel: 'Dualar',
          }}
        />
        <Tab.Screen
          name="Zikirmatik"
          component={ZikirmatikScreen}
          options={{
            tabBarLabel: 'Zikirmatik',
          }}
        />
        <Tab.Screen
          name="Ana Sayfa"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Ana Sayfa',
          }}
        />
        <Tab.Screen
          name="Pusula"
          component={CompassScreen}
          options={{
            tabBarLabel: 'Pusula',
          }}
        />
        <Tab.Screen
          name="Ayarlar"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Ayarlar',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
});
