import { View, Text, StyleSheet } from 'react-native';

export default function Manutencao() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>oficinas</Text>
      <Text style={styles.subtitle}>Aqui fica as oficinas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666' },
});