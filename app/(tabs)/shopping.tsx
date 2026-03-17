import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../supabase';

export default function ShoppingScreen() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [shoppingList, setShoppingList] = useState<any[]>([]);

  // 1. Hent både produkter og nåværende handleliste
  const fetchData = async () => {
    setLoading(true);
    
    // Hent produkter basert på søk
    const productQuery = supabase.from('products').select('*');
    if (searchQuery) {
      productQuery.ilike('name', `%${searchQuery}%`);
    }
    const { data: prodData } = await productQuery;

    // Hent handleliste og "join" med produktnavn
    const { data: listData } = await supabase
      .from('shopping_list')
      .select('id, products(name, category)');

    if (prodData) setProducts(prodData);
    if (listData) setShoppingList(listData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]); // Oppdaterer seg hver gang du skriver i søkefeltet

  // 2. Legg til i handleliste
  const addToCart = async (productId: number) => {
    const { error } = await supabase
      .from('shopping_list')
      .insert([{ product_id: productId }]);
    
    if (!error) fetchData();
  };

  // 3. Slett fra handleliste
  const removeFromList = async (id: number) => {
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id);
    
    if (!error) fetchData();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Handleliste 🛒</Text>

      {/* Søkefelt */}
      <TextInput
        style={styles.searchInput}
        placeholder="Søk etter varer..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tilgjengelige varer</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item.id)}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productCategory}>{item.category}</Text>
              <Text style={styles.addButton}>+ Legg til</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={[styles.section, { flex: 1 }]}>
        <Text style={styles.sectionTitle}>Min liste</Text>
        <FlatList
          data={shoppingList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>{item.products?.name}</Text>
              <TouchableOpacity onPress={() => removeFromList(item.id)}>
                <Text style={styles.deleteText}>Fjern</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Listen er tom. Legg til noe over!</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#E8F0E8' },
  title: { fontSize: 28, fontWeight: '800', color: '#2D4F32', marginBottom: 20 },
  searchInput: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 15, fontSize: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5
  },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#4A7C59', marginBottom: 10 },
  productCard: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 15, marginRight: 10, width: 120,
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: '#A3C4A3'
  },
  productName: { fontWeight: 'bold', fontSize: 14, color: '#1A2F1C' },
  productCategory: { fontSize: 10, color: '#88A090', marginTop: 2 },
  addButton: { marginTop: 10, color: '#4A7C59', fontWeight: 'bold', fontSize: 12 },
  listItem: { 
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', 
    padding: 15, borderRadius: 12, marginBottom: 8 
  },
  listItemText: { fontSize: 16, color: '#1A2F1C' },
  deleteText: { color: '#FF3B30', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#88A090', marginTop: 20 }
});