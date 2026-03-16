import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../supabase';

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);

  // 1. Hent meldinger
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages') // Husk stor M hvis du endret det i Supabase tidligere
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.log('Feil ved henting:', error);
    else setAllMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // 2. Send melding
  const sendMessage = async () => {
    if (message.trim().length === 0) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ content: message }]);

    if (error) {
      console.log('Feil ved sending:', error);
    } else {
      setMessage('');
      fetchMessages();
    }
  };

  // 3. Slett melding (Tilleggsfunksjon)
  const deleteMessage = async (id: number) => {
    Alert.alert(
      "Slett melding",
      "Er du sikker på at du vil fjerne denne meldingen?",
      [
        { text: "Avbryt", style: "cancel" },
        { 
          text: "Slett", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase
              .from('messages')
              .delete()
              .eq('id', id);
            
            if (error) console.log('Feil ved sletting:', error);
            else fetchMessages();
          } 
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* Velkomst og Intro */}
      <View style={styles.header}>
        <Text style={styles.title}>Meldingsapp</Text>
        <Text style={styles.subtitle}>
          Dette er en sanntids-prototype koblet til Supabase. 
          Hold inne på en melding for å slette den.
        </Text>
      </View>
      
      {/* Input-feltet */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Skriv hva du vil..."
          placeholderTextColor="#88A090"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Meldingsliste */}
      <FlatList
        data={allMessages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onLongPress={() => deleteMessage(item.id)}
            activeOpacity={0.7}
            style={styles.messageItem}
          >
            <Text style={styles.messageText}>{item.content}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 70, 
    paddingHorizontal: 20, 
    backgroundColor: '#E8F0E8' // Rolig, lys grønn bakgrunn (Sage)
  },
  header: {
    marginBottom: 25,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#2D4F32', // Mørkegrønn tekst
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 14,
    color: '#5A7A60',
    marginTop: 5,
    lineHeight: 20,
  },
  inputContainer: { 
    flexDirection: 'row', 
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#2D4F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  input: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    fontSize: 16,
    color: '#2D4F32'
  },
  button: { 
    backgroundColor: '#4A7C59', // Fin skoggrønn knapp
    paddingHorizontal: 22, 
    borderRadius: 15, 
    justifyContent: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  messageItem: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 18, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#A3C4A3' // En liten grønn detalj på siden av hver melding
  },
  messageText: {
    fontSize: 16,
    color: '#1A2F1C',
    lineHeight: 22
  },
  timestamp: {
    fontSize: 10,
    color: '#88A090',
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '500'
  }
});