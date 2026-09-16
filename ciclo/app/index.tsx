import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '@/constants/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleLogin() {
    if (!email || !senha) {
      alert('Preencha todos os campos');
      return;
    }
    
    try {
      // 1. Faz a requisição para a API
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password: senha,
      });
      
      const usuario = response.data;
      
      // 2. Salva o ID do usuário na memória do celular
      await AsyncStorage.setItem('@user_id', String(usuario.id));
      
      // 3. Verifica se tem bikes e redireciona
      if (usuario.bikes?.length === 0) {
        router.replace({ pathname: '/onboarding', params: { userId: usuario.id } });
      } else {
        router.replace('/(tabs)');
      }
      
    } catch (error: any) {
      console.log(error?.message);
      alert('Email ou senha inválidos');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/cadastro')}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 15 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: '#007AFF' },
});