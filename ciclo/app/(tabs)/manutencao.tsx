import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, DimensionValue, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dados simulados para o design. 
// Futuramente, esses dados virão da sua API cruzando o odômetro da bike com a tabela de "valores médios".
const pecasSimuladas = [
  { id: '1', nome: 'Corrente', kmRodado: 1200, kmLimite: 2500, icone: 'link-outline' },
  { id: '2', nome: 'Pneu Traseiro', kmRodado: 4800, kmLimite: 5000, icone: 'disc-outline' },
  { id: '3', nome: 'Pneu Dianteiro', kmRodado: 1500, kmLimite: 5000, icone: 'disc-outline' },
  { id: '4', nome: 'Pastilha de Freio', kmRodado: 1200, kmLimite: 1500, icone: 'stop-circle-outline' },
  { id: '5', nome: 'Cassete', kmRodado: 3500, kmLimite: 10000, icone: 'cog-outline' },
];

export default function Manutencao() {
  
  // mudando statuzinhos massas
  const getStatusSaude = (kmRodado: number, kmLimite: number) => {
    const porcentagemGasta = (kmRodado / kmLimite) * 100;
    const saudeRestante = Math.max(0, 100 - porcentagemGasta); // Garante que não fique negativo

    let cor = '#34C759'; 
    let status = 'Em bom estado';

    if (saudeRestante <= 15) {
      cor = '#FF3B30'; 
      status = 'Troca urgente';
    } else if (saudeRestante <= 40) {
      cor = '#FF9500'; 
      status = 'Planejar troca';
    }

    return { saudeRestante: saudeRestante.toFixed(0), cor, status };
  };

  const renderPeca = ({ item }: { item: any }) => {
    const { saudeRestante, cor, status } = getStatusSaude(item.kmRodado, item.kmLimite);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.nomeContainer}>
            <Ionicons name={item.icone as any} size={20} color="#555" style={styles.icone} />
            <Text style={styles.nomePeca}>{item.nome}</Text>
          </View>
          <Text style={[styles.statusBadge, { color: cor, borderColor: cor }]}>
            {status}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Uso: {item.kmRodado} / {item.kmLimite} km</Text>
          <Text style={[styles.porcentagemText, { color: cor }]}>{saudeRestante}% Vida útil</Text>
        </View>

        
      <View style={styles.barraFundo}>
        <View 
          style={[
            styles.barraProgresso, 
            { width: `${saudeRestante}%` as DimensionValue, backgroundColor: cor }
          ]} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Status das Peças</Text>
        <Text style={styles.subtitle}>Acompanhe o desgaste com base na quilometragem.</Text>
      </View>

      <FlatList
        data={pecasSimuladas}
        keyExtractor={(item) => item.id}
        renderItem={renderPeca}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icone: {
    marginRight: 8,
  },
  nomePeca: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  porcentagemText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  barraFundo: {
    height: 8,
    backgroundColor: '#EAEAEA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraProgresso: {
    height: '100%',
    borderRadius: 4,
  },
});