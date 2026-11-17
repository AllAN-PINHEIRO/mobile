import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator,TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect,useRouter } from 'expo-router';
import axios from 'axios';

import { API_URL } from '@/constants/api';
import { getBikeId } from '@/utils/bike';
import { CardSaudeBike } from '@/components/CardSaudeBike';

type StatusPeca = 'bom' | 'medio' | 'ruim';

type PecaStatus = {
  id: string;
  nome: string;
  vidaRestante: number;
  status: StatusPeca;
  comunidade: {
    tipoBike: string;
    totalTrocas: number;
    vidaRestante: number;
    status: StatusPeca;
  } | null;
};

type Resumo = {
  apelido: string;
  tipo: string;
  kmAtual: number;
  pecas: PecaStatus[];
  kmUltimaManutencao: number | null;
};

const ROTULOS_TIPO: Record<string, string> = {
  mtb: 'MTB',
  road: 'Speed / Road',
  gravel: 'Gravel',
  urbana: 'Urbana',
  outra: 'Outra',
};

function calcularIndicadorSaude(
  itens: { nome: string; vidaRestante: number; status: StatusPeca }[]
) {
  const media =
    itens.length > 0
      ? itens.reduce((soma, p) => soma + p.vidaRestante, 0) / itens.length
      : 100;

  const urgentes = itens.filter((p) => p.status === 'ruim');
  const emAtencao = itens.filter((p) => p.status === 'medio');

  let corStatus = '#34C759';
  let textoStatus = 'Bike em Ótimo Estado';

  if (urgentes.length > 0) {
    corStatus = '#FF3B30';
    textoStatus = 'Manutenção Urgente';
  } else if (emAtencao.length > 0) {
    corStatus = '#FF9500';
    textoStatus = 'Atenção Necessária';
  }

  return {
    media,
    corStatus,
    textoStatus,
    pecasAtencao: [...urgentes, ...emAtencao].map((p) => p.nome),
  };
}

export default function Home() {
  const router = useRouter();
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

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
        tipo: pecasRes.data.bike.tipo ?? 'outra',
        kmAtual: pecasRes.data.bike.kmAtual,
        pecas: pecasRes.data.pecas,
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

  const rotuloTipo = ROTULOS_TIPO[resumo.tipo] ?? resumo.tipo.toUpperCase();

  // 1. Saúde Geral Padrão (Referência Oficial)
  const saudePadrao = calcularIndicadorSaude(resumo.pecas);

  // 2. Saúde Geral Comunidade (Média dinâmica para o tipo desta bike)
  const itensComunidade = resumo.pecas
    .filter((p) => p.comunidade !== null)
    .map((p) => ({
      nome: p.nome,
      vidaRestante: p.comunidade!.vidaRestante,
      status: p.comunidade!.status,
    }));

  const temDadosComunidade = itensComunidade.length > 0;
  const saudeComunidade = temDadosComunidade ? calcularIndicadorSaude(itensComunidade) : null;

  const odometroTotal = Number(resumo.kmAtual.toFixed(2));
  const kmDesdeUltimaManutencao =
  resumo.kmUltimaManutencao != null
    ? Math.max(0, Number((resumo.kmAtual - resumo.kmUltimaManutencao).toFixed(2)))
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá</Text>
        <Text style={styles.subtitle}>{resumo.apelido} · {rotuloTipo}</Text>
      </View>

      {/* Card 1: Saúde Geral Padrão */}
      <CardSaudeBike
        titulo="Saúde Geral da Bike"
        subtituloOrigem="Padrão"
        porcentagem={saudePadrao.media}
        corStatus={saudePadrao.corStatus}
        textoStatus={saudePadrao.textoStatus}
        pecasAtencao={saudePadrao.pecasAtencao}
      />

      {/* Card 2: Saúde Geral Comunidade */}
      <CardSaudeBike
        titulo="Saúde Geral · Comunidade"
        subtituloOrigem={rotuloTipo}
        porcentagem={saudeComunidade ? saudeComunidade.media : null}
        corStatus={saudeComunidade ? saudeComunidade.corStatus : '#8E8E93'}
        textoStatus={
          saudeComunidade
            ? saudeComunidade.textoStatus
            : 'Sem dados da comunidade ainda'
        }
        pecasAtencao={saudeComunidade ? saudeComunidade.pecasAtencao : []}
        rodapeInfo={
          temDadosComunidade
            ? `Baseado em ${itensComunidade.length} de ${resumo.pecas.length} peças com trocas registradas na comunidade`
            : `Registre trocas de peças para alimentar a média de bikes ${rotuloTipo}`
        }
      />

      {/* Card de Odômetro */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Odômetro</Text>
        <TouchableOpacity
            style={styles.pedalButton}
            onPress={() => router.push('/pedal' as any)}
          >
            <Ionicons name="navigate-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.pedalButtonText}>Iniciar Pedal (GPS)</Text>
          </TouchableOpacity>

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
    marginBottom: 30,
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
  pedalButton: { 
    flexDirection: 'row', 
    backgroundColor: '#34C759', 
    paddingVertical: 12, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 18 },
  
  pedalButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 15 }
});