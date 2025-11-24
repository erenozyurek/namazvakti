import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Zikir, deleteZikir, getZikirler, saveZikir } from '../services/zikirService';

type ScreenMode = 'LIST' | 'ADD' | 'COUNT';

export const ZikirmatikScreen: React.FC = () => {
  console.log('ZikirmatikScreen rendering'); // Debug log
  const [mode, setMode] = useState<ScreenMode>('LIST');
  const [zikirler, setZikirler] = useState<Zikir[]>([]);
  const [selectedZikir, setSelectedZikir] = useState<Zikir | null>(null);
  
  // Add Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Counter State
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    loadZikirler();
  }, []);

  const loadZikirler = async () => {
    const data = await getZikirler();
    setZikirler(data);
  };

  const handleAddZikir = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Hata', 'Lütfen zikir adı giriniz.');
      return;
    }

    const target = parseInt(newTarget) || 0;
    const newZikir: Zikir = {
      id: Date.now().toString(),
      title: newTitle,
      count: 0,
      target: target,
    };

    await saveZikir(newZikir);
    await loadZikirler();
    setMode('LIST');
    setNewTitle('');
    setNewTarget('');
  };

  const handleStartCount = (zikir: Zikir) => {
    setSelectedZikir(zikir);
    setCurrentCount(zikir.count);
    setMode('COUNT');
  };

  const handleSaveCount = async () => {
    if (selectedZikir) {
      const updatedZikir = { ...selectedZikir, count: currentCount };
      await saveZikir(updatedZikir);
      await loadZikirler();
      setMode('LIST');
      setSelectedZikir(null);
    }
  };

  const handleDeleteZikir = async (id: string) => {
    Alert.alert('Sil', 'Bu zikri silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteZikir(id);
          loadZikirler();
        },
      },
    ]);
  };

  const renderListItem = ({ item }: { item: Zikir }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleStartCount(item)}
      onLongPress={() => handleDeleteZikir(item.id)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardCount}>
            {item.count} / {item.target > 0 ? item.target : '∞'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#FFD700" />
      </View>
      <View style={[styles.progressBar, { width: `${Math.min((item.count / (item.target || 1)) * 100, 100)}%` }]} />
    </TouchableOpacity>
  );

  // --- RENDER HELPERS ---

  const renderList = () => (
    <View style={styles.listContainer}>
      <FlatList
        data={zikirler}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz zikir eklenmemiş. {'\n'} + butonuna basarak ekleyebilirsiniz.</Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setMode('ADD')}
      >
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const renderAdd = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.formTitle}>Yeni Zikir Ekle</Text>
          
          <Text style={styles.label}>Zikir Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Ya Latif"
            placeholderTextColor="#666"
            value={newTitle}
            onChangeText={setNewTitle}
          />

          <Text style={styles.label}>Hedef Sayı (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 100"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={newTarget}
            onChangeText={setNewTarget}
          />

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                Keyboard.dismiss();
                setMode('LIST');
              }}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleAddZikir}
            >
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  const renderCount = () => (
    <TouchableOpacity
      style={styles.counterContainer}
      activeOpacity={1}
      onPress={() => setCurrentCount((c) => c + 1)}
    >
      <View style={styles.counterHeader}>
        <Text style={styles.counterTitle}>{selectedZikir?.title}</Text>
        <Text style={styles.counterTarget}>
          Hedef: {selectedZikir?.target && selectedZikir.target > 0 ? selectedZikir.target : 'Yok'}
        </Text>
      </View>

      <View style={styles.counterDisplay}>
        <Text style={styles.countText}>{currentCount}</Text>
        <Text style={styles.tapText}>Saymak için dokun</Text>
      </View>

      <View style={styles.counterControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent counting
            handleSaveCount();
          }}
        >
          <Ionicons name="save-outline" size={24} color="#000" />
          <Text style={styles.controlButtonText}>Kaydet & Çık</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.resetButton]}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert('Sıfırla', 'Sayaç sıfırlansın mı?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Evet', onPress: () => setCurrentCount(0) }
            ]);
          }}
        >
          <Ionicons name="refresh-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/backgroundImg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {mode === 'LIST' && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Zikirmatik</Text>
          </View>
        )}

        {mode === 'LIST' && renderList()}
        {mode === 'ADD' && renderAdd()}
        {mode === 'COUNT' && renderCount()}

      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyText: {
    color: '#CCC',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 14,
    color: '#FFD700',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#FFD700',
    opacity: 0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  // Form Styles
  keyboardAvoidingView: {
    flex: 1,
  },
  formContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: 'flex-start',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  saveButton: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  // Counter Styles
  counterContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 100,
  },
  counterHeader: {
    alignItems: 'center',
  },
  counterTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  counterTarget: {
    fontSize: 16,
    color: '#CCC',
  },
  counterDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tapText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 20,
  },
  counterControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  controlButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingHorizontal: 16,
  },
});
