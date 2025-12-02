import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserLocation = {
  latitude: number;
  longitude: number;
  city?: string;
};

const LOCATION_KEY = 'user_location';

export async function saveUserLocation(location: UserLocation) {
  await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

export async function getUserLocation(): Promise<UserLocation | null> {
  const data = await AsyncStorage.getItem(LOCATION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
