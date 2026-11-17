import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '@/constants/api';
import { TIPOS_BIKE } from '@/constants/tiposBike';

type ModeloSugestao = { id: string; modelo: string; marca: string; tipo: string };
type Componente = { id: string; chave: string; nome: string };
type DetalhePeca = { data: string; km: string };
type PecaPayload = { chave: string; data: string; kmInstalacao?: number };

type Etapa = 'modelo' | 'marca-tipo' | 'apelido-ano' | 'manutencao' | 'pecas' | 'detalhes';

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
  const [kmAtual, setKmAtual] = useState('');

  // Catálogo de componentes vindo da API
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [pecasSelecionadas, setPecasSelecionadas] = useState<string[]>([]); // guarda a "chave" do componente
  const [detalhes, setDetalhes] = useState<Record<string, DetalhePeca>>({});
  const [enviando, setEnviando] = useState(false);

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

  function togglePeca(chave: string) {
    setPecasSelecionadas((atual) =>
      atual.includes(chave) ? atual.filter((c) => c !== chave) : [...atual, chave]
    );
  }

  function atualizarDetalhe(chave: string, campo: keyof DetalhePeca, valor: string) {
    setDetalhes((atual) => ({
      ...atual,
      [chave]: { data: '', km: '', ...atual[chave], [campo]: valor },
    }));
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
      alert('Informe a marca e selecione o tipo da bike');
      return;
    }
    setEtapa('apelido-ano');
  }

  function handleContinuarApelidoAno() {
    if (!apelido || !ano) {
      alert('Preencha apelido e ano da bike');
      return;
    }
    if (kmAtual && isNaN(parseFloat(kmAtual.replace(',', '.')))) {
      alert('Informe a quilometragem atual apenas com números');
      return;
    }
    setEtapa('manutencao');
  }

  function handleContinuarPecas() {
    if (pecasSelecionadas.length === 0) {
      alert('Selecione ao menos uma peça');
      return;
    }
    setEtapa('detalhes');
  }

  async function finalizarCadastro(pecas: PecaPayload[]) {
    setEnviando(true);
    try {
      const response = await axios.post(`${API_URL}/bikes`, {
        userId,
        apelido,
        ano: parseInt(ano, 10),
        modelo,
        marca: modeloReaproveitado ? undefined : marca,
        tipo: modeloReaproveitado ? undefined : tipo,
        kmAtual: kmAtual ? parseFloat(kmAtual.replace(',', '.')) : 0,
        pecas,
      });

      // Guarda a bike ativa caso ainda não exista uma
      const jaTemBike = await AsyncStorage.getItem('@bike_id');
      if (!jaTemBike) {
        await AsyncStorage.setItem('@bike_id', String(response.data.id));
      }

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

  function handleConcluirDetalhes() {
    const pecas: PecaPayload[] = [];

    for (const chave of pecasSelecionadas) {
      const nome = componentes.find((c) => c.chave === chave)?.nome ?? chave;
      const detalhe = detalhes[chave] ?? { data: '', km: '' };

      const partes = detalhe.data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!partes) {
        alert(`Informe a data de "${nome}" no formato DD/MM/AAAA`);
        return;
      }

      const kmTexto = detalhe.km.trim().replace(',', '.');
      if (kmTexto && isNaN(parseFloat(kmTexto))) {
        alert(`O km de instalação de "${nome}" deve conter apenas números`);
        return;
      }

      const [, dia, mes, anoData] = partes;
      pecas.push({
        chave,
        data: `${anoData}-${mes}-${dia}`,
        kmInstalacao: kmTexto ? parseFloat(kmTexto) : undefined,
      });
    }

    finalizarCadastro(pecas);
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

          <Text style={styles.rotulo}>Tipo da bike</Text>
          {TIPOS_BIKE.map((t) => {
            const selecionado = tipo === t.valor;
            return (
              <TouchableOpacity
                key={t.valor}
                style={[styles.pecaItem, selecionado && styles.pecaItemSelecionada]}
                onPress={() => setTipo(t.valor)}>
                <Text style={selecionado ? styles.pecaTextoSelecionado : undefined}>{t.rotulo}</Text>
              </TouchableOpacity>
            );
          })}

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
          <TextInput
            style={styles.input}
            placeholder="Km atual da bike (se souber)"
            value={kmAtual}
            onChangeText={setKmAtual}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleContinuarApelidoAno}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      {etapa === 'manutencao' && (
        <View>
          <Text style={styles.pergunta}>Você trocou ou fez manutenção em alguma peça recentemente?</Text>
          <TouchableOpacity style={styles.button} onPress={() => setEtapa('pecas')}>
            <Text style={styles.buttonText}>Sim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecundario]}
            onPress={() => finalizarCadastro([])}
            disabled={enviando}>
            <Text style={styles.buttonText}>{enviando ? 'Enviando...' : 'Não'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {etapa === 'pecas' && (
        <View>
          <Text style={styles.pergunta}>Em quais peças?</Text>
          {componentes.length === 0 && (
            <Text style={styles.aviso}>Carregando a lista de peças...</Text>
          )}
          {componentes.map((c) => {
            const selecionada = pecasSelecionadas.includes(c.chave);
            return (
              <TouchableOpacity
                key={c.chave}
                style={[styles.pecaItem, selecionada && styles.pecaItemSelecionada]}
                onPress={() => togglePeca(c.chave)}>
                <Text style={selecionada ? styles.pecaTextoSelecionado : undefined}>{c.nome}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.button} onPress={handleContinuarPecas}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      {etapa === 'detalhes' && (
        <View>
          <TouchableOpacity onPress={() => setEtapa('pecas')}>
            <Text style={styles.voltar}>‹ Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.pergunta}>Quando foi feita a manutenção?</Text>
          <Text style={styles.aviso}>
            Se você souber o km da bike nessa data, informe também. Isso deixa o cálculo de desgaste mais preciso.
          </Text>

          {pecasSelecionadas.map((chave) => {
            const nome = componentes.find((c) => c.chave === chave)?.nome ?? chave;
            const detalhe = detalhes[chave] ?? { data: '', km: '' };
            return (
              <View key={chave} style={styles.blocoPeca}>
                <Text style={styles.rotulo}>{nome}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Data (DD/MM/AAAA)"
                  value={detalhe.data}
                  onChangeText={(v) => atualizarDetalhe(chave, 'data', v)}
                  keyboardType="numbers-and-punctuation"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Km da bike nessa data (opcional)"
                  value={detalhe.km}
                  onChangeText={(v) => atualizarDetalhe(chave, 'km', v)}
                  keyboardType="numeric"
                />
              </View>
            );
          })}

          <TouchableOpacity style={styles.button} onPress={handleConcluirDetalhes} disabled={enviando}>
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
  aviso: { fontSize: 13, color: '#666', marginBottom: 15, textAlign: 'center' },
  rotulo: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 },
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
  blocoPeca: { marginBottom: 5 },
});
