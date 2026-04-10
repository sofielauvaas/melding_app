import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../supabase';

export default function ShoppingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);

  // 1. Hent data fra Supabase
  const fetchData = async () => {
    let { data: prodData } = await supabase.from('products').select('*').order('name');
    let { data: listData } = await supabase
      .from('shopping_list')
      .select('id, product_id, quantity, is_done, products(name, category, emoji)')
      .order('is_done', { ascending: true }) // Legger ferdige varer nederst
      .order('created_at', { ascending: false });

    if (prodData) setProducts(prodData);
    if (listData) setShoppingList(listData);
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Logikk for å endre antall
  const updateQuantity = async (itemId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      await supabase.from('shopping_list').delete().eq('id', itemId);
    } else {
      await supabase.from('shopping_list').update({ quantity: newQty }).eq('id', itemId);
    }
    fetchData();
  };

  // 3. Logikk for å krysse av/på en vare
  const toggleDone = async (itemId: number, currentStatus: boolean) => {
    await supabase.from('shopping_list').update({ is_done: !currentStatus }).eq('id', itemId);
    fetchData();
  };

  // 4. Logikk for å tømme hele listen
  const clearList = async () => {
    Alert.alert("Tøm liste", "Er du sikker på at du vil slette alt i handlelisten?", [
      { text: "Avbryt", style: "cancel" },
      { text: "Slett alt", style: "destructive", onPress: async () => {
        await supabase.from('shopping_list').delete().neq('id', 0); 
        fetchData();
      }}
    ]);
  };

  // 5. Legge til ny vare
  const addItem = async (productId: number) => {
    const existing = shoppingList.find(item => item.product_id === productId);
    if (existing) {
      updateQuantity(existing.id, existing.quantity, 1);
    } else {
      await supabase.from('shopping_list').insert([{ product_id: productId, quantity: 1, is_done: false }]);
      fetchData();
    }
    setSearchQuery('');
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      
      {/* Overskrift og Tøm-knapp */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Handleliste</Text>
        {shoppingList.length > 0 && (
          <TouchableOpacity onPress={clearList}>
            <Text style={styles.clearBtn}>Tøm alt</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Søkefelt og Katalog-knapp */}
      <View style={styles.headerButtons}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Søk etter varer..." 
          value={searchQuery} 
          onChangeText={(text) => { setSearchQuery(text); if (text.length > 0) setShowCatalog(false); }} 
          placeholderTextColor="#88A090"
        />
        <TouchableOpacity 
          style={[styles.catalogBtn, showCatalog && styles.catalogBtnActive]} 
          onPress={() => { setShowCatalog(!showCatalog); setSearchQuery(''); }}
        >
          <Text style={styles.catalogBtnText}>{showCatalog ? 'Lukk' : 'Katalog'}</Text>
        </TouchableOpacity>
      </View>

      {/* Søkeforslag */}
      {searchQuery.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {filteredProducts.slice(0, 5).map(p => (
            <TouchableOpacity key={p.id} style={styles.suggestionItem} onPress={() => addItem(p.id)}>
              <Text style={styles.suggestionText}>{p.emoji} {p.name}</Text>
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Varekatalog (Nedtrekksmeny) */}
      {showCatalog && (
        <View style={styles.catalogContainer}>
          <ScrollView style={{ maxHeight: 250 }}>
            {categories.map(cat => (
              <View key={cat} style={styles.categoryBlock}>
                <Text style={styles.categoryLabel}>{cat}</Text>
                <View style={styles.productGrid}>
                  {products.filter(p => p.category === cat).map(p => (
                    <TouchableOpacity key={p.id} style={styles.miniProduct} onPress={() => addItem(p.id)}>
                      <Text style={{fontSize: 18}}>{p.emoji}</Text>
                      <Text style={styles.miniProductText}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Handlelisten */}
      <View style={{ flex: 1, marginTop: 10 }}>
        <Text style={styles.sectionHeader}>Varer i kurven</Text>
        
        {/* Hjelpetekst */}
        {shoppingList.length > 0 && (
          <Text style={styles.hintText}>
            Tips: Trykk på varen for å markere som utført
          </Text>
        )}

        <FlatList
          data={shoppingList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.cartItem, item.is_done && styles.cartItemDone]}>
              <TouchableOpacity style={styles.cartItemLeft} onPress={() => toggleDone(item.id, item.is_done)}>
                <Text style={[styles.emojiText, item.is_done && { opacity: 0.5 }]}>{item.products?.emoji}</Text>
                <View>
                  <Text style={[styles.cartItemName, item.is_done && styles.textDone]}>{item.products?.name}</Text>
                  <Text style={styles.cartItemCategory}>{item.products?.category}</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity, -1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity, 1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Ingen varer i kurven.</Text>}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 20, backgroundColor: '#E8F0E8' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 32, fontWeight: '800', color: '#2D4F32' },
  clearBtn: { color: '#BC4B4B', fontWeight: '600', fontSize: 14 },
  headerButtons: { flexDirection: 'row', gap: 10, marginBottom: 10, zIndex: 10 },
  searchInput: { flex: 3, backgroundColor: '#fff', padding: 15, borderRadius: 15, fontSize: 16 },
  catalogBtn: { flex: 1.2, backgroundColor: '#4A7C59', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  catalogBtnActive: { backgroundColor: '#2D4F32' },
  catalogBtnText: { color: '#fff', fontWeight: 'bold' },
  suggestionsContainer: { backgroundColor: '#fff', borderRadius: 15, marginTop: 5, padding: 5, elevation: 5, zIndex: 20 },
  suggestionItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  suggestionText: { fontSize: 16 },
  addIcon: { color: '#4A7C59', fontWeight: 'bold', fontSize: 18 },
  catalogContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginTop: 10, marginBottom: 10, elevation: 5 },
  categoryBlock: { marginBottom: 12 },
  categoryLabel: { fontSize: 10, fontWeight: 'bold', color: '#88A090', textTransform: 'uppercase', marginBottom: 6 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  miniProduct: { backgroundColor: '#F0F7F0', padding: 8, borderRadius: 10, alignItems: 'center', minWidth: 65 },
  miniProductText: { fontSize: 10, color: '#2D4F32', marginTop: 2 },
  sectionHeader: { fontSize: 12, fontWeight: '800', color: '#5A7A60', textTransform: 'uppercase', marginTop: 15, marginBottom: 5, letterSpacing: 1 },
  hintText: { fontSize: 12, color: '#88A090', fontStyle: 'italic', marginBottom: 10 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 10 },
  cartItemDone: { opacity: 0.6, backgroundColor: '#F9FBF9' },
  cartItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  textDone: { textDecorationLine: 'line-through', color: '#88A090' },
  emojiText: { fontSize: 24 },
  cartItemName: { fontSize: 17, fontWeight: '600', color: '#1A2F1C' },
  cartItemCategory: { fontSize: 11, color: '#88A090' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0F7F0', borderRadius: 12, padding: 4 },
  qtyBtn: { width: 28, height: 28, backgroundColor: '#fff', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#4A7C59' },
  qtyValue: { fontWeight: 'bold', color: '#2D4F32', minWidth: 20, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#88A090', marginTop: 60 }
});