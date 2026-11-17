import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import axios from 'axios';

import { API_URL } from '@/constants/api';
import { getBikeId } from '@/utils/bike';

type PecaStatus = {
  id: string;
  nome: string;
  vidaRestante: number;
  status: 'bom' | 'medio' | 'ruim';
};

type Resumo = {
  apelido: string;
  kmAtual: number;
  pecas: PecaStatus[];
  kmUltimaManutencao: number | null;
};

export default function Home() {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Busca o estado das peças e o histórico da bike ativa sempre que a Home volta ao foco
  const carregarResumo = useCallback(async () => {
    try {
      setErro('');
      const bikeId = await getBikeId();
      if (!bikeId) {
        setResumo(null);
        setErro('Nenhuma bike cadastrada.');
        return;
      }

      const [pecasRes, historicoRes] = await Promise.all([
        axios.get(`${API_URL}/bikes/${bikeId}/pecas`),
        axios.get(`${API_URL}/manutencoes/${bikeId}`),
      ]);

      const historico = historicoRes.data as { km: number }[];
      setResumo({
        apelido: pecasRes.data.bike.apelido,
        kmAtual: pecasRes.data.bike.kmAtual,
        pecas: pecasRes.data.pecas,
        // o histórico já vem ordenado da manutenção mais recente para a mais antiga
        kmUltimaManutencao: historico.length > 0 ? historico[0].km : null,
      });
    } catch (error: any) {
      console.log('Erro ao carregar a Home:', error?.message);
      setErro('Não foi possível carregar os dados da bike.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarResumo();
    }, [carregarResumo])
  );

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!resumo) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={styles.subtitle}>{erro || 'Nenhuma bike cadastrada.'}</Text>
      </View>
    );
  }

  // Saúde geral: média da vida útil restante de todas as peças
  const saudeMedia =
    resumo.pecas.length > 0
      ? resumo.pecas.reduce((soma, p) => soma + p.vidaRestante, 0) / resumo.pecas.length
      : 100;
  const saudeExibicao = saudeMedia.toFixed(0);

  // A cor e o texto seguem a pior peça: uma corrente no limite não pode ser escondida pela média
  const urgentes = resumo.pecas.filter((p) => p.status === 'ruim');
  const emAtencao = resumo.pecas.filter((p) => p.status === 'medio');

  let corStatus = '#34C759';
  let textoStatus = 'Bike em Ótimo Estado';

  if (urgentes.length > 0) {
    corStatus = '#FF3B30';
    textoStatus = 'Manutenção Urgente';
  } else if (emAtencao.length > 0) {
    corStatus = '#FF9500';
    textoStatus = 'Atenção Necessária';
  }

  const precisamAtencao = [...urgentes, ...emAtencao].map((p) => p.nome);

  const odometroTotal = Math.round(resumo.kmAtual);
  const kmDesdeUltimaManutencao =
    resumo.kmUltimaManutencao != null
      ? Math.max(0, Math.round(resumo.kmAtual - resumo.kmUltimaManutencao))
      : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá</Text>
        <Text style={styles.subtitle}>{resumo.apelido}</Text>
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
          {precisamAtencao.length > 0 && (
            <Text style={styles.atencaoText}>Peças para acompanhar: {precisamAtencao.join(', ')}</Text>
          )}
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
            <Text style={styles.odoValue}>{kmDesdeUltimaManutencao != null ? `${kmDesdeUltimaManutencao} km` : '—'}</Text>
            <Text style={styles.odoLabel}>{kmDesdeUltimaManutencao != null ? 'Desde a última revisão' : 'Nenhuma revisão registrada'}</Text>
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
  atencaoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
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