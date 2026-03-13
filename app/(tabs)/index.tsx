import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase'; // Går ut av mapper for å finne fila di

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);

  // 1. Funksjon for å hente meldinger fra Supabase
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.log('Feil ved henting:', error);
    else setAllMessages(data);
  };

  // 2. Kjør henting når appen starter
  useEffect(() => {
    fetchMessages();
  }, []);

  // 3. Funksjon for å sende melding
  const sendMessage = async () => {
    if (message.trim().length === 0) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ content: message }]);

    if (error) {
      console.log('Feil ved sending:', error);
    } else {
      setMessage(''); // Tøm feltet
      fetchMessages(); // Oppdater lista
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Min Meldings-app</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Skriv en melding..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 50, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginRight: 10 },
  button: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, justifyContent: 'center' },
  buttonText: { color: '#white', fontWeight: 'bold' },
  messageItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }
});