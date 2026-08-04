import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, StatusBar } from 'react-native';
import Chat from './src/components/Chat';

export default function App() {
  const [customerId, setCustomerId] = useState(1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#1a1a2e" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TelLink Support</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Assistance</Text>
      </View>
      <View style={styles.selectContainer}>
        <Text style={styles.label}>Customer:</Text>
        <View style={styles.picker}>
          {[
            { id: 1, name: 'Alice Johnson' },
            { id: 2, name: 'Bob Smith' },
            { id: 3, name: 'Carol Williams' },
            { id: 4, name: 'David Brown' },
            { id: 5, name: 'Eve Davis' },
          ].map((c) => (
            <Text
              key={c.id}
              style={[
                styles.pickerItem,
                customerId === c.id && styles.pickerItemActive,
              ]}
              onPress={() => setCustomerId(c.id)}
            >
              {c.name}
            </Text>
          ))}
        </View>
      </View>
      <Chat customerId={customerId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  selectContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 6,
    color: '#555',
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pickerItem: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#fff',
    fontSize: 12,
    color: '#555',
    overflow: 'hidden',
  },
  pickerItemActive: {
    backgroundColor: '#e94560',
    color: '#fff',
  },
});