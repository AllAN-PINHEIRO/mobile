import React,{ useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dados simulados
const bikesSimuladas = [
  { id: '1', apelido: 'Gravel Explorer', odometro_total: 5430 },
  { id: '2', apelido: 'MTB Fim de Semana', odometro_total: 1200 },
];

export default function MinhasBikes() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function carregarId() {
      const idSalvo = await AsyncStorage.getItem('@user_id');
      if (idSalvo) {
        setUserId(idSalvo);
      }
    }
    carregarId();
  }, []);

  const renderBike = ({ item }: { item: any }) => (
    <View style={styles.bikeCard}>
      <View style={styles.bikeIconContainer}>
        <Ionicons name="bicycle" size={32} color="#007AFF" />
      </View>
      <View style={styles.bikeInfo}>
        <Text style={styles.bikeName}>{item.apelido}</Text>
        <Text style={styles.bikeOdometro}>Odômetro: {item.odometro_total} km</Text>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="create-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Minhas Bikes</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <FlatList
        data={bikesSimuladas}
        keyExtractor={(item) => item.id}
        renderItem={renderBike}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma bike cadastrada ainda.</Text>
        }
      />

            
        <View style={styles.footer}>
                <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                    if (userId) {
                    router.push({ 
                        pathname: '/onboarding', 
                        params: { origem: 'minhas-bikes', userId: userId } 
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
    paddingTop: 50, // Ajuste para descer abaixo da barra de status do celular
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
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Espaço para não ficar atrás do botão inferior
  },
  bikeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  bikeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bikeInfo: {
    flex: 1,
  },
  bikeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bikeOdometro: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    padding: 10,
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