import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { getBikeId } from '@/utils/bike';

type TipoManutencao = 'rotina' | 'troca';
type Componente = { id: string; chave: string; nome: string };

export default function CadastroManutencao() {
  const router = useRouter();
  
  const [tipo, setTipo] = useState<TipoManutencao>('rotina');
  
  // Estados para o formulário
  const [data, setData] = useState('');
  const [kmAtual, setKmAtual] = useState(''); // <-- Novo estado para o KM
  const [descricao, setDescricao] = useState('');
  
  // Estados específicos para "Troca de Peça"
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [componenteChave, setComponenteChave] = useState('');
  const [marcaNova, setMarcaNova] = useState('');

  const [enviando, setEnviando] = useState(false);

  // Carrega o catálogo de componentes para escolher o que foi trocado
  useEffect(() => {
    async function carregarCatalogo() {
      try {
        const response = await axios.get(`${API_URL}/componentes`);
        setComponentes(response.data);
      } catch (error: any) {
        console.log('Erro ao carregar catálogo:', error?.message);
      }
    }
    carregarCatalogo();
  }, []);

  async function handleSalvar() {
    if (!data || !kmAtual) {
      alert('Informe a data e a quilometragem da manutenção.');
      return;
    }
    
    if (tipo === 'troca' && !componenteChave) {
      alert('Informe qual peça foi trocada.');
      return;
    }

    setEnviando(true);

    try {
      // Pega o ID da bike ativa (se não estiver salvo, busca a primeira bike do usuário na API)
      const bikeId = await getBikeId();
      
      if (!bikeId) {
        alert('Erro: Nenhuma bike selecionada.');
        setEnviando(false);
        return;
      }
      
      // Converte a data string DD/MM/AAAA para formato ISO (AAAA-MM-DD)
      const partesData = data.split('/');
      let dataIso = new Date().toISOString(); // fallback para hoje
      if (partesData.length === 3) {
        dataIso = new Date(`${partesData[2]}-${partesData[1]}-${partesData[0]}T12:00:00Z`).toISOString();
      }

      const km = parseFloat(kmAtual.replace(',', '.'));
      if (isNaN(km)) {
        alert('Informe a quilometragem apenas com números.');
        setEnviando(false);
        return;
      }

      const nomePeca = componentes.find((c) => c.chave === componenteChave)?.nome ?? '';

      const payload = {
        bikeId,
        tipo,
        km,
        titulo: tipo === 'troca' ? `Troca de ${nomePeca}` : 'Manutenção de Rotina',
        descricao: tipo === 'troca'
          ? `Peça: ${nomePeca}. Marca: ${marcaNova || 'Não informada'}. ${descricao}`
          : descricao,
        data: dataIso,
        componenteChave: tipo === 'troca' ? componenteChave : undefined,
      };

      await axios.post(`${API_URL}/manutencoes`, payload);

      alert('Manutenção registrada com sucesso!');
      router.back(); // Volta para a tela de histórico, que vai recarregar a lista
    } catch (error: any) {
      console.log('Erro ao salvar:', error?.message);
      alert('Erro ao salvar a manutenção no servidor.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={enviando}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Nova Manutenção</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.selectorContainer}>
          <TouchableOpacity 
            style={[styles.selectorButton, tipo === 'rotina' && styles.selectorButtonActive]}
            onPress={() => setTipo('rotina')}
          >
            <Text style={[styles.selectorText, tipo === 'rotina' && styles.selectorTextActive]}>Rotina</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.selectorButton, tipo === 'troca' && styles.selectorButtonActive]}
            onPress={() => setTipo('troca')}
          >
            <Text style={[styles.selectorText, tipo === 'troca' && styles.selectorTextActive]}>Troca de Peça</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Data</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={data}
              onChangeText={setData}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={{ width: 15 }} />
          <View style={styles.flex1}>
            <Text style={styles.label}>KM da Bike</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1250"
              value={kmAtual}
              onChangeText={setKmAtual}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        {tipo === 'troca' ? (
          <View style={styles.cardDestaque}>
            <Text style={styles.labelDestaque}>O que foi trocado?</Text>
            <View style={styles.chipsContainer}>
              {componentes.map((c) => {
                const selecionado = componenteChave === c.chave;
                return (
                  <TouchableOpacity
                    key={c.chave}
                    style={[styles.chip, selecionado && styles.chipAtivo]}
                    onPress={() => setComponenteChave(c.chave)}
                  >
                    <Text style={[styles.chipText, selecionado && styles.chipTextAtivo]}>{c.nome}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.labelDestaque}>Marca / Modelo Novo (Opcional)</Text>
            <TextInput style={styles.input} placeholder="Ex: Shimano HG53" value={marcaNova} onChangeText={setMarcaNova} />
          </View>
        ) : (
          <View style={styles.dicaContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.dicaText}>Use para limpezas, calibração ou regulagens gerais sem troca de peças.</Text>
          </View>
        )}

        <Text style={styles.label}>Descrição / Observações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={tipo === 'rotina' ? "Ex: Lubrificação da corrente." : "Motivo da troca."}
          value={descricao}
          onChangeText={setDescricao}
          multiline numberOfLines={4} textAlignVertical="top"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar} disabled={enviando}>
          {enviando ? (
             <ActivityIndicator color="#fff" />
          ) : (
             <Text style={styles.saveButtonText}>Salvar Registro</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  backButton: { padding: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 20 },
  selectorContainer: { flexDirection: 'row', backgroundColor: '#EAEAEA', borderRadius: 8, padding: 4, marginBottom: 25 },
  selectorButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  selectorButtonActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  selectorText: { color: '#666', fontWeight: '600' },
  selectorTextActive: { color: '#007AFF', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flex1: { flex: 1 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16 },
  textArea: { height: 100 },
  cardDestaque: { backgroundColor: '#E5F1FF', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#B3D4FF' },
  labelDestaque: { fontSize: 15, fontWeight: 'bold', color: '#005bb5', marginBottom: 8 },
  dicaContainer: { flexDirection: 'row', backgroundColor: '#EAEAEA', padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  dicaText: { flex: 1, marginLeft: 10, color: '#555', fontSize: 13, lineHeight: 18 },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#B3D4FF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  chipAtivo: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  chipText: { color: '#005bb5', fontSize: 14 },
  chipTextAtivo: { color: '#fff', fontWeight: 'bold' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});