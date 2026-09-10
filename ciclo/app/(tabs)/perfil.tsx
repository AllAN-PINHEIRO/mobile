import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Perfil() {
  const router = useRouter();
//define um cabeçalho com imagem(mais tarde tenho que substituir para foto do usuario) e cria um menu com botão para o cadastro de bikes(ainda não tenho a tela de cadastro de bikes)
  return (
    <View style={styles.container}>
      {/* cabeçalho */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
          style={styles.profileImage} 
        />
        <Text style={styles.userName}>Vasco da gama</Text>
        <Text style={styles.userEmail}>seila@email.com</Text>
      </View>

      {/* menu */}
      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => router.push('/minhas-bikes' as any)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="bicycle-outline" size={24} color="#007AFF" />
          </View>
          <Text style={styles.menuText}>Minhas Bikes</Text>
          <Ionicons name="chevron-forward-outline" size={22} color="#ccc" />
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
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, 
    backgroundColor: '#E1E4E8',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  menu: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5F1FF', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1, 
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
});