import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const [phones, setPhones] = useState([]);
  const [filteredPhones, setFilteredPhones] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'flagship', name: 'Флагманы' },
    { id: 'midrange', name: 'Средний класс' },
    { id: 'budget', name: 'Бюджетные' }
  ];

  useEffect(() => {
    loadPhones();
  }, []);

  useEffect(() => {
    filterPhones();
  }, [searchQuery, selectedCategory, phones]);

  const loadPhones = async () => {
    try {
      // В реальном приложении заменить на ваш URL
      const response = await axios.get('http://localhost:5000/api/phones');
      setPhones(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить каталог');
    } finally {
      setLoading(false);
    }
  };

  const filterPhones = () => {
    let filtered = phones;

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(phone => phone.category === selectedCategory);
    }

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter(phone =>
        phone.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPhones(filtered);
  };

  const renderPhoneItem = ({ item }) => (
    <TouchableOpacity
      style={styles.phoneCard}
      onPress={() => navigation.navigate('Subscription', { phone: item })}
    >
      <View style={styles.phoneImageContainer}>
        <Image
          style={styles.phoneImage}
          source={{ uri: item.image || 'https://via.placeholder.com/150' }}
          defaultSource={require('../../assets/placeholder.png')}
        />
      </View>
      
      <View style={styles.phoneInfo}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.model}>{item.model}</Text>
        <Text style={styles.price}>{item.price.toLocaleString()} ₽</Text>
        
        <View style={styles.specs}>
          <Text style={styles.specText}>{item.specifications?.storage}</Text>
          <Text style={styles.specText}>{item.specifications?.camera}</Text>
        </View>

        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Выбрать</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Загрузка каталога...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Поиск */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск смартфонов..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Категории */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === item.id && styles.categoryTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Список смартфонов */}
      <FlatList
        data={filteredPhones}
        keyExtractor={item => item._id}
        renderItem={renderPhoneItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.phonesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Смартфоны не найдены</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryText: {
    color: '#4A4A4A',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  phonesList: {
    paddingBottom: 20,
  },
  phoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phoneImageContainer: {
    marginRight: 15,
  },
  phoneImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  phoneInfo: {
    flex: 1,
  },
  brand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 2,
  },
  model: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  specs: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  specText: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4A4A4A',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});

export default HomeScreen;
