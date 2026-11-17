import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, DimensionValue, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';

import { API_URL } from '@/constants/api';
import { getBikeId } from '@/utils/bike';

type StatusPeca = 'bom' | 'medio' | 'ruim';

type DadosComunidade = {
  tipoBike: string;
  totalTrocas: number;
  limiteMin: number;
  limiteMax: number;
  menorDuracao: number | null;
  maiorDuracao: number | null;
  vidaRestante: number;
  status: StatusPeca;
};

type PecaStatus = {
  id: string;
  chave: string;
  nome: string;
  unidade: 'km' | 'meses';
  desgaste: number;
  limiteMax: number | null;
  vidaRestante: number;
  status: StatusPeca;
  comunidade: DadosComunidade | null;
  sinaisDesgaste: string;
  observacao: string | null;
};

const ICONES: Record<string, string> = {
  corrente: 'link-outline',
  cassete: 'cog-outline',
  coroas: 'cog-outline',
  pneus: 'disc-outline',
  pastilhas: 'stop-circle-outline',
  discos: 'ellipse-outline',
  'movimento-central': 'sync-outline',
  suspensao: 'swap-vertical-outline',
  quadro: 'cube-outline',
};

const ESTADOS: Record<StatusPeca, { cor: string; texto: string }> = {
  bom: { cor: '#34C759', texto: 'Em bom estado' },
  medio: { cor: '#FF9500', texto: 'Planejar troca' },
  ruim: { cor: '#FF3B30', texto: 'Troca urgente' },
};

const ROTULOS_TIPO: Record<string, string> = {
  mtb: 'MTB',
  road: 'Speed / Road',
  gravel: 'Gravel',
  urbana: 'Urbana',
  outra: 'Outra',
};

export default function Manutencao() {
  const router = useRouter();
  const [pecas, setPecas] = useState<PecaStatus[]>([]);
  const [tipoBike, setTipoBike] = useState<string>('outra');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarPecas = useCallback(async () => {
    try {
      setErro('');
      const bikeId = await getBikeId();
      if (!bikeId) {
        setPecas([]);
        setErro('Nenhuma bike cadastrada.');
        return;
      }
      const response = await axios.get(`${API_URL}/bikes/${bikeId}/pecas`);
      setPecas(response.data.pecas);
      setTipoBike(response.data.bike?.tipo ?? 'outra');
    } catch (error: any) {
      console.log('Erro ao carregar peças:', error?.message);
      setErro('Não foi possível carregar o estado das peças.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPecas();
    }, [carregarPecas])
  );

  const renderPeca = ({ item }: { item: PecaStatus }) => {
    const { cor, texto } = ESTADOS[item.status];
    const unidade = item.unidade === 'km' ? 'km' : 'meses';
    const usoPadrao = item.limiteMax != null
      ? `Padrão: uso ${Math.round(item.desgaste)} / ${Math.round(item.limiteMax)} ${unidade}`
      : `Uso: ${Math.round(item.desgaste)} ${unidade}`;

    const com = item.comunidade;
    const estadoCom = com ? ESTADOS[com.status] : null;
    const rotuloTipo = ROTULOS_TIPO[tipoBike] ?? tipoBike.toUpperCase();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.nomeContainer}>
            <Ionicons name={(ICONES[item.chave] ?? 'build-outline') as any} size={20} color="#555" style={styles.icone} />
            <Text style={styles.nomePeca}>{item.nome}</Text>
          </View>
          <Text style={[styles.statusBadge, { color: cor, borderColor: cor }]}>
            {texto}
          </Text>
        </View>

        {/* 1. Vida útil pelo Padrão Oficial */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{usoPadrao}</Text>
          <Text style={[styles.porcentagemText, { color: cor }]}>{item.vidaRestante}% Vida útil</Text>
        </View>

        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraProgresso,
              { width: `${item.vidaRestante}%` as DimensionValue, backgroundColor: cor }
            ]}
          />
        </View>

        {/* 2. Vida útil pela Média Dinâmica da Comunidade */}
        <View style={styles.comunidadeContainer}>
          {com && estadoCom ? (
            <>
              <View style={styles.comunidadeHeader}>
                <View style={styles.comunidadeTituloRow}>
                  <Ionicons name="people-outline" size={15} color="#007AFF" />
                  <Text style={styles.comunidadeTitulo}>
                    Comunidade ({rotuloTipo} · {com.totalTrocas} {com.totalTrocas === 1 ? 'troca' : 'trocas'})
                  </Text>
                </View>
                <Text style={[styles.comunidadeStatus, { color: estadoCom.cor }]}>
                  {estadoCom.texto}
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Uso: {Math.round(item.desgaste)} / Média {Math.round(com.limiteMax)} {unidade}
                </Text>
                <Text style={[styles.porcentagemText, { color: estadoCom.cor }]}>
                  {com.vidaRestante}% Vida útil
                </Text>
              </View>

              <View style={styles.barraFundo}>
                <View
                  style={[
                    styles.barraProgresso,
                    { width: `${com.vidaRestante}%` as DimensionValue, backgroundColor: estadoCom.cor }
                  ]}
                />
              </View>
            </>
          ) : (
            <View style={styles.comunidadeVaziaRow}>
              <Ionicons name="people-outline" size={15} color="#888" />
              <Text style={styles.comunidadeVaziaText}>
                Comunidade ({rotuloTipo}): sem trocas registradas ainda
              </Text>
            </View>
          )}
        </View>

        {(item.status !== 'bom' || com?.status === 'medio' || com?.status === 'ruim') && (
          <Text style={styles.sinaisText}>Sinais de desgaste: {item.sinaisDesgaste}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Status das Peças</Text>
        <Text style={styles.subtitle}>
          Compare o desgaste pela referência oficial e pela média real da comunidade ({ROTULOS_TIPO[tipoBike] ?? tipoBike}).
        </Text>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={pecas}
          keyExtractor={(item) => item.id}
          renderItem={renderPeca}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.vazioText}>{erro || 'Nenhuma peça encontrada.'}</Text>}
          ListFooterComponent={<View style={{ height: 90 }} />}
        />
      )}

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
    flex: 1,
    paddingRight: 8,
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
    marginBottom: 6,
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
  comunidadeContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  comunidadeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  comunidadeTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comunidadeTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  comunidadeStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  comunidadeVaziaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comunidadeVaziaText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  sinaisText: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    lineHeight: 17,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vazioText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 15,
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