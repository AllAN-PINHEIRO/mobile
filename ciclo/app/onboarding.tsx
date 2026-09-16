import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import { API_URL } from '@/constants/api';

type ModeloSugestao = { id: string; modelo: string; marca: string; tipo: string };

const PECAS_PADRAO = [
  'Corrente',
  'Cassete/Coroa',
  'Pastilhas de Freio',
  'Pneus/Câmaras',
  'Amortecedor/Suspensão',
  'Rolamentos (Movimento Central)',
  'Cabos de Câmbio e Freio',
  'Correia de Transmissão',
];

type Etapa = 'modelo' | 'marca-tipo' | 'apelido-ano' | 'manutencao' | 'pecas' | 'data';

export default function Onboarding() {
  const router = useRouter();
  
  // Captura o userId e a nova variável "origem" para saber de onde o usuário veio
  const { userId, origem } = useLocalSearchParams<{ userId: string; origem?: string }>();
  
  // Variável que verifica se é um cadastro de uma nova bike vindo da tela de perfil
  const isNovaBike = origem === 'minhas-bikes';

  const [etapa, setEtapa] = useState<Etapa>('modelo');

  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [tipo, setTipo] = useState('');
  const [modeloReaproveitado, setModeloReaproveitado] = useState(false);
  const [sugestoes, setSugestoes] = useState<ModeloSugestao[]>([]);
  const [verificandoModelo, setVerificandoModelo] = useState(false);
  const [apelido, setApelido] = useState('');
  const [ano, setAno] = useState('');

  const [pecasSelecionadas, setPecasSelecionadas] = useState<string[]>([]);
  const [dataManutencao, setDataManutencao] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (modeloReaproveitado || modelo.trim().length < 2) {
      setSugestoes([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const response = await axios.get(`${API_URL}/modelos`, { params: { q: modelo.trim() } });
        setSugestoes(response.data);
      } catch (error: any) {
        console.log(error?.message);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [modelo, modeloReaproveitado]);

  function selecionarSugestao(sugestao: ModeloSugestao) {
    setModelo(sugestao.modelo);
    setMarca(sugestao.marca);
    setTipo(sugestao.tipo);
    setModeloReaproveitado(true);
    setSugestoes([]);
  }

  function handleMudarModelo(texto: string) {
    setModelo(texto);
    setModeloReaproveitado(false);
  }

  function togglePeca(peca: string) {
    setPecasSelecionadas((atual) =>
      atual.includes(peca) ? atual.filter((p) => p !== peca) : [...atual, peca]
    );
  }

  async function handleContinuarModelo() {
    if (!modelo.trim()) {
      alert('Informe o modelo da bike');
      return;
    }

    if (modeloReaproveitado) {
      setEtapa('apelido-ano');
      return;
    }

    setVerificandoModelo(true);
    try {
      const response = await axios.get(`${API_URL}/modelos`, { params: { q: modelo.trim() } });
      const encontrado: ModeloSugestao | undefined = response.data.find(
        (m: ModeloSugestao) => m.modelo.toLowerCase() === modelo.trim().toLowerCase()
      );
      if (encontrado) {
        selecionarSugestao(encontrado);
        setEtapa('apelido-ano');
      } else {
        setEtapa('marca-tipo');
      }
    } catch (error: any) {
      console.log(error?.message);
      alert('Erro ao consultar o catálogo de modelos');
    } finally {
      setVerificandoModelo(false);
    }
  }

  function handleContinuarMarcaTipo() {
    if (!marca || !tipo) {
      alert('Informe marca e tipo da bike');
      return;
    }
    setEtapa('apelido-ano');
  }

  function handleContinuarApelidoAno() {
    if (!apelido || !ano) {
      alert('Preencha apelido e ano da bike');
      return;
    }
    setEtapa('manutencao');
  }

  function handleContinuarPecas() {
    if (pecasSelecionadas.length === 0) {
      alert('Selecione ao menos uma peça');
      return;
    }
    setEtapa('data');
  }

  async function finalizarCadastro(manutencoes: { peca: string; data: string }[]) {
    setEnviando(true);
    try {
      await axios.post(`${API_URL}/bikes`, {
        userId,
        apelido,
        ano: parseInt(ano, 10),
        modelo,
        marca: modeloReaproveitado ? undefined : marca,
        tipo: modeloReaproveitado ? undefined : tipo,
        manutencoes,
      });

      // Lógica de redirecionamento dinâmico
      if (isNovaBike) {
        alert('Nova bike cadastrada com sucesso!');
        router.back(); // Retorna para a tela de Minhas Bikes
      } else {
        router.replace('/(tabs)'); // Vai para a Home no primeiro login
      }
      
    } catch (error: any) {
      console.log(error?.message);
      alert('Erro ao cadastrar a bike');
    } finally {
      setEnviando(false);
    }
  }

  function handleConcluirComData() {
    const partes = dataManutencao.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!partes) {
      alert('Informe a data no formato DD/MM/AAAA');
      return;
    }
    const [, dia, mesNum, anoNum] = partes;
    const dataIso = `${anoNum}-${mesNum}-${dia}`;
    finalizarCadastro(pecasSelecionadas.map((peca) => ({ peca, data: dataIso })));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Título dinâmico que muda conforme a origem do usuário */}
      <Text style={styles.title}>
        {isNovaBike ? 'Cadastrar Nova Bike' : 'Cadastre sua primeira bike'}
      </Text>

      {etapa === 'modelo' && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Modelo da bike"
            value={modelo}
            onChangeText={handleMudarModelo}
          />
          {sugestoes.length > 0 && (
            <View style={styles.sugestoes}>
              {sugestoes.map((sugestao) => (
                <TouchableOpacity
                  key={sugestao.id}
                  style={styles.sugestaoItem}
                  onPress={() => selecionarSugestao(sugestao)}>
                  <Text>
                    {sugestao.modelo} ({sugestao.marca} · {sugestao.tipo})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleContinuarModelo} disabled={verificandoModelo}>
            <Text style={styles.buttonText}>{verificandoModelo ? 'Verificando...' : 'Continuar'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {etapa === 'marca-tipo' && (
        <View>
          <TouchableOpacity onPress={() => setEtapa('modelo')}>
            <Text style={styles.voltar}>‹ Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.pergunta}>Modelo novo, conte mais sobre ele:</Text>
          <TextInput style={styles.input} placeholder="Marca" value={marca} onChangeText={setMarca} />
          <TextInput style={styles.input} placeholder="Tipo (ex: MTB, Speed, Urbana)" value={tipo} onChangeText={setTipo} />
          <TouchableOpacity style={styles.button} onPress={handleContinuarMarcaTipo}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      {etapa === 'apelido-ano' && (
        <View>
          <TouchableOpacity onPress={() => setEtapa(modeloReaproveitado ? 'modelo' : 'marca-tipo')}>
            <Text style={styles.voltar}>‹ Voltar</Text>
          </TouchableOpacity>
          <TextInput style={styles.input} placeholder="Apelido da bike" value={apelido} onChangeText={setApelido} />
          <TextInput
            style={styles.input}
            placeholder="Ano"
            value={ano}
            onChangeText={setAno}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleContinuarApelidoAno}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      {etapa === 'manutencao' && (
        <View>
          <Text style={styles.pergunta}>Você fez manutenção recentemente nessa bike?</Text>
          <TouchableOpacity style={styles.button} onPress={() => setEtapa('pecas')}>
            <Text style={styles.buttonText}>Sim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecundario]}
            onPress={() => finalizarCadastro([])}
            disabled={enviando}>
            <Text style={styles.buttonText}>Não</Text>
          </TouchableOpacity>
        </View>
      )}

      {etapa === 'pecas' && (
        <View>
          <Text style={styles.pergunta}>Em quais peças?</Text>
          {PECAS_PADRAO.map((peca) => {
            const selecionada = pecasSelecionadas.includes(peca);
            return (
              <TouchableOpacity
                key={peca}
                style={[styles.pecaItem, selecionada && styles.pecaItemSelecionada]}
                onPress={() => togglePeca(peca)}>
                <Text style={selecionada ? styles.pecaTextoSelecionado : undefined}>{peca}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.button} onPress={handleContinuarPecas}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      {etapa === 'data' && (
        <View>
          <Text style={styles.pergunta}>Quando foi a última manutenção?</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={dataManutencao}
            onChangeText={setDataManutencao}
            keyboardType="numbers-and-punctuation"
          />
          <TouchableOpacity style={styles.button} onPress={handleConcluirComData} disabled={enviando}>
            <Text style={styles.buttonText}>{enviando ? 'Enviando...' : 'Concluir cadastro'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  pergunta: { fontSize: 18, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  voltar: { color: '#007AFF', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 15 },
  sugestoes: { marginTop: -10, marginBottom: 15, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  sugestaoItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonSecundario: { backgroundColor: '#8E8E93' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  pecaItem: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 10 },
  pecaItemSelecionada: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  pecaTextoSelecionado: { color: '#fff', fontWeight: 'bold' },
});