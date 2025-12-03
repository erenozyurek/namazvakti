import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Asset } from 'expo-asset';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { CompassScreen } from './src/screens/CompassScreen';
import DuaDetailScreen from './src/screens/DuaDetailScreen';
import DualarScreen from './src/screens/DualarScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ZikirmatikScreen } from './src/screens/ZikirmatikScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tüm background resimlerini başta tanımla
const BACKGROUND_IMAGE = require('./assets/images/backgroundImg.png');
const KABE_MORNING = require('./assets/images/kabeMorning.png');
const KABE_NIGHT = require('./assets/images/kabeNight.png');
const KABE_SUNSET = require('./assets/images/kabeSunset.png');

// Resimleri önceden yükle ve cache'le
const cacheImages = async () => {
  const images = [BACKGROUND_IMAGE, KABE_MORNING, KABE_NIGHT, KABE_SUNSET];
  
  try {
    const cachePromises = images.map(image => {
      return Asset.fromModule(image).downloadAsync();
    });
    
    await Promise.all(cachePromises);
    return true;
  } catch (e) {
    console.warn('Resim yükleme hatası:', e);
    return false;
  }
};

function DualarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DualarMain" component={DualarScreen} />
      <Stack.Screen 
        name="DuaDetail" 
        component={DuaDetailScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Tüm arka plan resimlerini önceden yükle
        await cacheImages();
      } catch (e) {
        console.warn('Resim yükleme hatası:', e);
      } finally {
        setIsReady(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

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
            if (route.name === 'Ana Sayfa') {
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
            } else if (route.name === 'Dualar') {
              return <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color} />;
            } else if (route.name === 'Zikirmatik') {
              return <MaterialCommunityIcons name={focused ? 'counter' : 'counter'} size={size} color={color} />;
            } else if (route.name === 'Pusula') {
              return <MaterialCommunityIcons name="compass" size={size} color={color} />;
            } else if (route.name === 'Ayarlar') {
              return <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />;
            }
            return <Ionicons name="help-circle-outline" size={size} color={color} />;
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
          name="Zikirmatik"
          component={ZikirmatikScreen}
          options={{
            tabBarLabel: 'Zikirmatik',
          }}
        />
        <Tab.Screen
          name="Dualar"
          component={DualarStack}
          options={{
            tabBarLabel: 'Dualar',
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
