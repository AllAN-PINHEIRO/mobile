import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type TipoManutencao = 'rotina' | 'troca';

export default function CadastroManutencao() {
  const router = useRouter();
  
  const [tipo, setTipo] = useState<TipoManutencao>('rotina');
  
  // Estados para o formulário
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  
  // Estados específicos para "Troca de Peça"
  const [pecaTrocada, setPecaTrocada] = useState('');
  const [marcaNova, setMarcaNova] = useState('');

  function handleSalvar() {
    // Futuramente, enviaremos os dados para a API aqui
    if (!data) {
      alert('Informe a data da manutenção.');
      return;
    }
    
    if (tipo === 'troca' && !pecaTrocada) {
      alert('Informe qual peça foi trocada.');
      return;
    }

    alert('Manutenção registrada com sucesso!');
    router.back();
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
            <Text style={[styles.selectorText, tipo === 'rotina' && styles.selectorTextActive]}>
              Manutenção de Rotina
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.selectorButton, tipo === 'troca' && styles.selectorButtonActive]}
            onPress={() => setTipo('troca')}
          >
            <Text style={[styles.selectorText, tipo === 'troca' && styles.selectorTextActive]}>
              Troca de Peça
            </Text>
          </TouchableOpacity>
        </View>

        
        <Text style={styles.label}>Data do Serviço</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={data}
          onChangeText={setData}
          keyboardType="numbers-and-punctuation"
        />

        
        {tipo === 'troca' ? (
          <View style={styles.cardDestaque}>
            <Text style={styles.labelDestaque}>O que foi trocado?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Corrente, Pastilha de Freio..."
              value={pecaTrocada}
              onChangeText={setPecaTrocada}
            />
            
            <Text style={styles.labelDestaque}>Marca / Modelo Novo (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Shimano HG53"
              value={marcaNova}
              onChangeText={setMarcaNova}
            />
          </View>
        ) : (
          <View style={styles.dicaContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.dicaText}>
              Use a opção "Rotina" para limpezas, calibração, aplicação de óleo ou regulagens gerais onde nenhuma peça nova foi instalada.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Descrição do Serviço</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={tipo === 'rotina' ? "Ex: Lubrificação da corrente e calibragem." : "Motivo da troca ou observações extras."}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/*  Salvar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>Salvar Registro</Text>
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
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16 },
  textArea: { height: 100 },
  cardDestaque: { backgroundColor: '#E5F1FF', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#B3D4FF' },
  labelDestaque: { fontSize: 15, fontWeight: 'bold', color: '#005bb5', marginBottom: 8 },
  dicaContainer: { flexDirection: 'row', backgroundColor: '#EAEAEA', padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  dicaText: { flex: 1, marginLeft: 10, color: '#555', fontSize: 13, lineHeight: 18 },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});