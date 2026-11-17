import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';

import { API_URL } from '@/constants/api';
import { getBikeId } from '@/utils/bike';
import { calcularDistanciaKm } from '@/utils/geo';

type EstadoPedal = 'parado' | 'rodando' | 'pausado';

export default function PedalGPS() {
  const router = useRouter();

  const [estado, setEstado] = useState<EstadoPedal>('parado');
  const [kmPercorrido, setKmPercorrido] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [velocidadeKmh, setVelocidadeKmh] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const ultimaPosicaoRef = useRef<{ latitude: number; longitude: number } | null>(null);

  // Cronômetro do treino
  useEffect(() => {
    if (estado !== 'rodando') return;
    const intervalo = setInterval(() => {
      setSegundos((s) => s + 1);
    }, 1000);
    return () => clearInterval(intervalo);
  }, [estado]);

  // Limpa o GPS caso o usuário saia da tela
  useEffect(() => {
    return () => {
      pararMonitoramentoGPS();
    };
  }, []);

  function pararMonitoramentoGPS() {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    ultimaPosicaoRef.current = null;
  }

  async function iniciarOuRetomar() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Ative a permissão de localização para medir a distância do pedal.'
      );
      return;
    }

    ultimaPosicaoRef.current = null;
    setEstado('rodando');

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000, // atualiza a cada 3 segundos
        distanceInterval: 5, // ou a cada 5 metros deslocados
      },
      (localizacao) => {
        const { latitude, longitude, accuracy, speed } = localizacao.coords;

        // Descarta leituras imprecisas (ex.: dentro de prédios)
        if (accuracy != null && accuracy > 30) return;

        if (speed != null && speed >= 0) {
          setVelocidadeKmh(Math.round(speed * 3.6));
        }

        if (ultimaPosicaoRef.current) {
          const deltaKm = calcularDistanciaKm(
            ultimaPosicaoRef.current.latitude,
            ultimaPosicaoRef.current.longitude,
            latitude,
            longitude
          );

          // Filtra pequenas oscilações de GPS quando parado
          if (deltaKm >= 0.005) {
            setKmPercorrido((atual) => atual + deltaKm);
            ultimaPosicaoRef.current = { latitude, longitude };
          }
        } else {
          ultimaPosicaoRef.current = { latitude, longitude };
        }
      }
    );
  }

  function pausarPedal() {
    pararMonitoramentoGPS();
    setVelocidadeKmh(0);
    setEstado('pausado');
  }

  async function finalizarESalvar() {
    pararMonitoramentoGPS();
    setEstado('pausado');

    const distanciaFinal = Number(kmPercorrido.toFixed(2));
    if (distanciaFinal <= 0) {
      Alert.alert(
        'Distância zerada',
        'Nenhum deslocamento foi registrado ainda. Deseja descartar o pedal?',
        [
          { text: 'Continuar', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => router.back() },
        ]
      );
      return;
    }

    setSalvando(true);
    try {
      const bikeId = await getBikeId();
      if (!bikeId) {
        alert('Nenhuma bike ativa encontrada.');
        setSalvando(false);
        return;
      }

      const { data } = await axios.post(`${API_URL}/pedais`, {
        bikeId,
        km: distanciaFinal,
      });

      alert(
        `Pedal salvo! +${distanciaFinal} km adicionados.\nOdômetro atual: ${Math.round(data.kmAtual)} km`
      );
      router.back();
    } catch (error: any) {
      console.log('Erro ao salvar pedal:', error?.message);
      alert('Não foi possível salvar o pedal no servidor.');
    } finally {
      setSalvando(false);
    }
  }

  function formatarTempo(totalSegundos: number) {
    const hrs = Math.floor(totalSegundos / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const secs = totalSegundos % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            pararMonitoramentoGPS();
            router.back();
          }}
          style={styles.backButton}
          disabled={salvando}
        >
          <Ionicons name="close" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Registrar Pedal</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.painelCentral}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  estado === 'rodando' ? '#34C759' : estado === 'pausado' ? '#FF9500' : '#8E8E93',
              },
            ]}
          />
          <Text style={styles.statusText}>
            {estado === 'rodando'
              ? 'Capturando GPS...'
              : estado === 'pausado'
              ? 'Pedal pausado'
              : 'Pronto para iniciar'}
          </Text>
        </View>

        <Text style={styles.kmValor}>{kmPercorrido.toFixed(2)}</Text>
        <Text style={styles.kmUnidade}>quilômetros</Text>

        <View style={styles.metricasRow}>
          <View style={styles.metricaCard}>
            <Ionicons name="time-outline" size={24} color="#007AFF" />
            <Text style={styles.metricaValor}>{formatarTempo(segundos)}</Text>
            <Text style={styles.metricaLabel}>Tempo</Text>
          </View>

          <View style={styles.metricaCard}>
            <Ionicons name="speedometer-outline" size={24} color="#FF9500" />
            <Text style={styles.metricaValor}>{velocidadeKmh} km/h</Text>
            <Text style={styles.metricaLabel}>Velocidade</Text>
          </View>
        </View>
      </View>

      <View style={styles.controles}>
        {estado === 'parado' && (
          <TouchableOpacity style={styles.btnIniciar} onPress={iniciarOuRetomar}>
            <Ionicons name="play" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnTexto}>Iniciar Pedal</Text>
          </TouchableOpacity>
        )}

        {estado === 'rodando' && (
          <TouchableOpacity style={styles.btnPausar} onPress={pausarPedal}>
            <Ionicons name="pause" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnTexto}>Pausar</Text>
          </TouchableOpacity>
        )}

        {estado === 'pausado' && (
          <View style={styles.botoesDuplos}>
            <TouchableOpacity style={[styles.btnIniciar, styles.flex1]} onPress={iniciarOuRetomar} disabled={salvando}>
              <Ionicons name="play" size={22} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.btnTexto}>Retomar</Text>
            </TouchableOpacity>

            <View style={{ width: 12 }} />

            <TouchableOpacity style={[styles.btnFinalizar, styles.flex1]} onPress={finalizarESalvar} disabled={salvando}>
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.btnTexto}>Finalizar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
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
  backButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  painelCentral: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
    gap: 8,
    elevation: 2,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, fontWeight: '600', color: '#555' },
  kmValor: { fontSize: 72, fontWeight: 'bold', color: '#11181C', lineHeight: 80 },
  kmUnidade: { fontSize: 18, color: '#666', marginBottom: 40 },
  metricasRow: { flexDirection: 'row', gap: 15, width: '100%' },
  metricaCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
  },
  metricaValor: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 8 },
  metricaLabel: { fontSize: 13, color: '#666', marginTop: 4 },
  controles: { padding: 20, paddingBottom: 40 },
  botoesDuplos: { flexDirection: 'row' },
  flex1: { flex: 1 },
  btnIniciar: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    paddingVertical: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  btnPausar: {
    flexDirection: 'row',
    backgroundColor: '#FF9500',
    paddingVertical: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  btnFinalizar: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  btnTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});