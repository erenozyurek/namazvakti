import { Audio, AVPlaybackStatus } from 'expo-av';
import { getEzanSelection } from './settingsService';

const ezanFiles = {
  ezan1: require('../../assets/sounds/ezan1.mp3'),
  ezan2: require('../../assets/sounds/ezan2.mp3'),
};

export const playEzan = async () => {
  try {
    const selectedEzan = await getEzanSelection();
    const soundObject = new Audio.Sound();
    await soundObject.loadAsync(ezanFiles[selectedEzan]);
    await soundObject.playAsync();
    // Otomatik durdurma için (isteğe bağlı)
    soundObject.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        soundObject.unloadAsync();
      }
    });
  } catch (e) {
    console.error('Ezan çalınamadı:', e);
  }
};
