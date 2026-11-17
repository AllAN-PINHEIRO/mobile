import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';

/* Retorna o id da bike ativa. Se ainda não estiver salvo, busca a primeira bike do usuário na API. */
export async function getBikeId(): Promise<string | null> {
  const salvo = await AsyncStorage.getItem('@bike_id');
  if (salvo) return salvo;

  const userId = await AsyncStorage.getItem('@user_id');
  if (!userId) return null;

  const { data } = await axios.get(`${API_URL}/bikes/usuario/${userId}`);
  if (data.length > 0) {
    await AsyncStorage.setItem('@bike_id', String(data[0].id));
    return String(data[0].id);
  }
  return null;
}
