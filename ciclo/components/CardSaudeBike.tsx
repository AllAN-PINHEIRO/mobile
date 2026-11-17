import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CardSaudeBikeProps = {
  titulo: string;
  subtituloOrigem: string;
  porcentagem: number | null;
  corStatus: string;
  textoStatus: string;
  pecasAtencao?: string[];
  rodapeInfo?: string;
};

export function CardSaudeBike({
  titulo,
  subtituloOrigem,
  porcentagem,
  corStatus,
  textoStatus,
  pecasAtencao = [],
  rodapeInfo,
}: CardSaudeBikeProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{titulo}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{subtituloOrigem}</Text>
        </View>
      </View>

      <View style={styles.healthContainer}>
        <View style={[styles.healthCircle, { borderColor: corStatus }]}>
          <Text style={[styles.healthPercentage, { color: corStatus }]}>
            {porcentagem != null ? `${porcentagem.toFixed(0)}%` : '--'}
          </Text>
        </View>

        <Text style={[styles.healthStatusText, { color: corStatus }]}>
          {textoStatus}
        </Text>

        {pecasAtencao.length > 0 && (
          <Text style={styles.atencaoText}>
            Peças para acompanhar: {pecasAtencao.join(', ')}
          </Text>
        )}

        {rodapeInfo ? (
          <Text style={styles.rodapeText}>{rodapeInfo}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 15,
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  healthContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  healthPercentage: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  healthStatusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  atencaoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  rodapeText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
  },
});