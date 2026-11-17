import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { API_URL } from '@/constants/api';

type Bike = {
  id: string;
  apelido: string;
  ano: number;
  kmAtual: number;
  modeloBike?: {
    modelo: string;
    marca: string;
    tipo: string;
  };
};

export default function MinhasBikes() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [bikeAtivaId, setBikeAtivaId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarBikes = useCallback(async () => {
    try {
      const [idSalvo, idBikeSalva] = await Promise.all([
        AsyncStorage.getItem('@user_id'),
        AsyncStorage.getItem('@bike_id'),
      ]);

      setUserId(idSalvo);
      if (!idSalvo) {
        setCarregando(false);
        return;
      }

      const response = await axios.get<Bike[]>(`${API_URL}/bikes/usuario/${idSalvo}`);
      const lista = response.data;
      setBikes(lista);

      if (lista.length > 0) {
        const existeAtiva = lista.some((b) => String(b.id) === idBikeSalva);
        if (existeAtiva && idBikeSalva) {
          setBikeAtivaId(idBikeSalva);
        } else {
          const primeiraId = String(lista[0].id);
          await AsyncStorage.setItem('@bike_id', primeiraId);
          setBikeAtivaId(primeiraId);
        }
      } else {
        setBikeAtivaId(null);
      }
    } catch (error: any) {
      console.log('Erro ao carregar bikes:', error?.message);
      alert('Não foi possível carregar suas bikes.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarBikes();
    }, [carregarBikes])
  );

  async function selecionarBikeAtiva(id: string) {
    const idString = String(id);
    await AsyncStorage.setItem('@bike_id', idString);
    setBikeAtivaId(idString);
  }

  const renderBike = ({ item }: { item: Bike }) => {
    const isAtiva = String(item.id) === bikeAtivaId;
    const subtituloModelo = item.modeloBike
      ? `${item.modeloBike.marca} ${item.modeloBike.modelo} · ${item.ano}`
      : `Ano ${item.ano}`;

    return (
      <TouchableOpacity
        style={[styles.bikeCard, isAtiva && styles.bikeCardAtiva]}
        onPress={() => selecionarBikeAtiva(item.id)}
        activeOpacity={0.75}
      >
        <View style={[styles.bikeIconContainer, isAtiva && styles.bikeIconContainerAtivo]}>
          <Ionicons name="bicycle" size={30} color={isAtiva ? '#fff' : '#007AFF'} />
        </View>

        <View style={styles.bikeInfo}>
          <Text style={styles.bikeName}>{item.apelido}</Text>
          <Text style={styles.bikeModelo}>{subtituloModelo}</Text>
          <Text style={styles.bikeOdometro}>Odômetro: {Math.round(item.kmAtual)} km</Text>
        </View>

        {isAtiva ? (
          <View style={styles.ativaBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
            <Text style={styles.ativaBadgeText}>Ativa</Text>
          </View>
        ) : (
          <Ionicons name="ellipse-outline" size={22} color="#CCC" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Minhas Bikes</Text>
        <View style={{ width: 24 }} />
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={bikes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBike}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            bikes.length > 0 ? (
              <Text style={styles.dicaTexto}>
                Toque em uma bike para defini-la como ativa na Home e na Manutenção.
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma bike cadastrada ainda.</Text>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (userId) {
              router.push({
                pathname: '/onboarding',
                params: { origem: 'minhas-bikes', userId },
              });
            } else {
              alert('Erro: Usuário não identificado. Faça login novamente.');
            }
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>Cadastrar Nova Bike</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 110,
  },
  dicaTexto: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
  },
  bikeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  bikeCardAtiva: {
    borderColor: '#007AFF',
  },
  bikeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bikeIconContainerAtivo: {
    backgroundColor: '#007AFF',
  },
  bikeInfo: {
    flex: 1,
    paddingRight: 8,
  },
  bikeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  bikeModelo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  bikeOdometro: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  ativaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  ativaBadgeText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});