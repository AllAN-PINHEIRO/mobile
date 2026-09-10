import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// simulaçãod e dados temporria
const pecasSimuladas = [
  { kmRodado: 1200, kmLimite: 2500 },
  { kmRodado: 4800, kmLimite: 5000 },
  { kmRodado: 1500, kmLimite: 5000 },
  { kmRodado: 1200, kmLimite: 1500 },
  { kmRodado: 3500, kmLimite: 10000 },
];

export default function Home() {
  const calcularSaudeGeral = () => {
    let somaSaude = 0;
    
    pecasSimuladas.forEach(peca => {
      const porcentagemGasta = (peca.kmRodado / peca.kmLimite) * 100;
      const saudeRestante = Math.max(0, 100 - porcentagemGasta);
      somaSaude += saudeRestante;
    });

    const media = somaSaude / pecasSimuladas.length;
    return media;
  };

  const saudeMedia = calcularSaudeGeral();
  const saudeExibicao = saudeMedia.toFixed(0);


  let corStatus = '#34C759'; 
  let textoStatus = 'Bike em Ótimo Estado';

  if (saudeMedia <= 25) {
    corStatus = '#FF3B30'; 
    textoStatus = 'Manutenção Urgente';
  } else if (saudeMedia <= 50) {
    corStatus = '#FF9500'; 
    textoStatus = 'Atenção Necessária';
  }

  // Odômetro isso aqui precisa puxar da API do banco de dados pra funfar legal
  const odometroTotal = 5430;
  const kmDesdeUltimaManutencao = 1200;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá</Text>
        <Text style={styles.subtitle}>resumo</Text>
      </View>

      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Saúde Geral da Bike</Text>
        <View style={styles.healthContainer}>
          <View style={[styles.healthCircle, { borderColor: corStatus }]}>
            <Text style={[styles.healthPercentage, { color: corStatus }]}>
              {saudeExibicao}%
            </Text>
          </View>
          <Text style={[styles.healthStatusText, { color: corStatus }]}>
            {textoStatus}
          </Text>
        </View>
      </View>

      {/* Card de Odômetro */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Odômetro</Text>
        
        <View style={styles.odoRow}>
          <View style={styles.odoItem}>
            <Ionicons name="speedometer-outline" size={32} color="#007AFF" />
            <Text style={styles.odoValue}>{odometroTotal} km</Text>
            <Text style={styles.odoLabel}>Total Rodado</Text>
          </View>
          
          <View style={styles.odoDivider} />
          
          <View style={styles.odoItem}>
            <Ionicons name="build-outline" size={32} color="#FF9500" />
            <Text style={styles.odoValue}>{kmDesdeUltimaManutencao} km</Text>
            <Text style={styles.odoLabel}>Desde a última revisão</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  healthContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  healthPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  healthStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  odoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  odoItem: {
    flex: 1,
    alignItems: 'center',
  },
  odoDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#EAEAEA',
    marginHorizontal: 15,
  },
  odoValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  odoLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});