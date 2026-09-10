import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dados simulados. Futuramente, isso virá  de manutenções no banco de dados.
const historicoSimulado = [
  {
    id: '1',
    data: '10 Set 2026',
    titulo: 'Revisão Geral',
    km: 5430,
    descricao: 'Limpeza completa, lubrificação da relação e regulagem dos freios.',
    icone: 'build-outline',
    cor: '#007AFF' // Azul
  },
  {
    id: '2',
    data: '15 Ago 2026',
    titulo: 'Troca de Pneu Traseiro',
    km: 4800,
    descricao: 'Pneu antigo substitúido devido a desgaste excessivo da borracha.',
    icone: 'disc-outline',
    cor: '#FF9500' // Laranja
  },
  {
    id: '3',
    data: '02 Mai 2026',
    titulo: 'Troca de Corrente',
    km: 2500,
    descricao: 'Corrente atingiu o limite de vida útil (alargamento).',
    icone: 'link-outline',
    cor: '#FF3B30' // Vermelho
  }
];

export default function Historico() {
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isLast = index === historicoSimulado.length - 1;

    return (
      <View style={styles.timelineItem}>
        
        <View style={styles.timelineGraphic}>
          <View style={[styles.dot, { backgroundColor: item.cor }]}>
            <Ionicons name={item.icone as any} size={16} color="#fff" />
          </View>
          {!isLast && <View style={styles.line} />}
        </View>

    
        <View style={styles.contentColumn}>
          <Text style={styles.dateText}>{item.data}</Text>
          
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

      <FlatList
        data={historicoSimulado}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  timelineGraphic: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Garante que a bolinha fique sobre a linha
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#D1D5DB', // Cor da linha conectora
    marginTop: -5,
    marginBottom: -5,
    zIndex: 1,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 25, // Espaçamento entre os itens
  },
  dateText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingRight: 10,
  },
  kmBadge: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  kmBadgeText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});