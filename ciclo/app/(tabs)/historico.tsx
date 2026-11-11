import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter,useFocusEffect } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';

export default function Historico() {
  const router = useRouter();
  const [manutencoes, setManutencoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Função para buscar o histórico do banco de dados da API
  async function carregarHistorico() {
    try {
      // Exemplo: recuperando a bike selecionada ou do usuário
      const bikeId = await AsyncStorage.getItem('@bike_id'); 
      if (!bikeId) {
        setCarregando(false);
        return;
      }

      const response = await axios.get(`${API_URL}/manutencoes/${bikeId}`);
      setManutencoes(response.data);
    } catch (error) {
      console.log('Erro ao carregar histórico:', error);
    } finally {
      setCarregando(false);
    }
  }

useFocusEffect(
  useCallback(() => {
    carregarHistorico();
  }, [])
);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isLast = index === manutencoes.length - 1;
    // Define cor e ícone com base no tipo salvo
    const isTroca = item.tipo === 'troca';
    const corIcone = isTroca ? '#FF9500' : '#007AFF';
    const nomeIcone = isTroca ? 'construct-outline' : 'build-outline';

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineGraphic}>
          <View style={[styles.dot, { backgroundColor: corIcone }]}>
            <Ionicons name={nomeIcone} size={16} color="#fff" />
          </View>
          {!isLast && <View style={styles.line} />}
        </View>

        <View style={styles.contentColumn}>
          <Text style={styles.dateText}>{new Date(item.data).toLocaleDateString('pt-BR')}</Text>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <View style={styles.kmBadge}>
                <Text style={styles.kmBadgeText}>{item.km} km</Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>{item.descricao}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Linha do tempo das suas manutenções.</Text>
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : manutencoes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma manutenção registrada ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={manutencoes}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Botão Fixo na Tela de Histórico para chamar o Cadastro */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/cadastro-manutencao' as any)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>Registrar Manutenção</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  listContainer: { padding: 20, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#888', marginTop: 10, fontSize: 16 },
  timelineItem: { flexDirection: 'row', marginBottom: 5 },
  timelineGraphic: { width: 40, alignItems: 'center' },
  dot: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  line: { flex: 1, width: 2, backgroundColor: '#D1D5DB', marginTop: -5, marginBottom: -5, zIndex: 1 },
  contentColumn: { flex: 1, paddingLeft: 10, paddingBottom: 25 },
  dateText: { fontSize: 13, fontWeight: 'bold', color: '#888', marginBottom: 6, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#333', paddingRight: 10 },
  kmBadge: { backgroundColor: '#E5F1FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  kmBadgeText: { color: '#007AFF', fontSize: 12, fontWeight: 'bold' },
  cardDescription: { fontSize: 14, color: '#666', lineHeight: 20 },
  footer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  addButton: { flexDirection: 'row', backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});