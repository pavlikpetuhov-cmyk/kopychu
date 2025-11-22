import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

const SubscriptionScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const [selectedType, setSelectedType] = useState('weekly');
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);

  const subscriptionTypes = [
    {
      id: 'daily',
      name: 'Ежедневно',
      minAmount: 100,
      description: 'Мелкие ежедневные платежи'
    },
    {
      id: 'weekly',
      name: 'Еженедельно', 
      minAmount: 700,
      description: 'Стабильные недельные платежи'
    },
    {
      id: 'monthly',
      name: 'Ежемесячно',
      minAmount: 3000,
      description: 'Крупные месячные платежи'
    }
  ];

  useEffect(() => {
    // Устанавливаем минимальную сумму для выбранного типа
    const type = subscriptionTypes.find(t => t.id === selectedType);
    if (type && amount < type.minAmount) {
      setAmount(type.minAmount);
    }
  }, [selectedType]);

  const calculateStats = () => {
    const type = subscriptionTypes.find(t => t.id === selectedType);
    const totalAmount = phone.price;
    const paymentsNeeded = Math.ceil(totalAmount / amount);
    
    let timeText = '';
    switch (selectedType) {
      case 'daily':
        timeText = `≈ ${paymentsNeeded} дней`;
        break;
      case 'weekly':
        timeText = `≈ ${Math.ceil(paymentsNeeded / 4.345)} месяцев`;
        break;
      case 'monthly':
        timeText = `≈ ${paymentsNeeded} месяцев`;
        break;
    }

    return {
      paymentsNeeded,
      timeText,
      monthlyAmount: selectedType === 'daily' ? amount * 30 : 
                    selectedType === 'weekly' ? amount * 4.345 : amount
    };
  };

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // В реальном приложении здесь будет ID пользователя из контекста/стора
      const userId = 'current-user-id'; // Заменить на реальный ID
      
      const subscriptionData = {
        userId,
        phoneId: phone._id,
        subscriptionType: selectedType,
        amount
      };

      // В реальном приложении заменить на ваш URL
      const response = await axios.post(
        'http://localhost:5000/api/subscriptions', 
        subscriptionData
      );

      Alert.alert(
        'Успех!', 
        'Подписка оформлена! Начинаем накопление.',
        [
          {
            text: 'Отлично!',
            onPress: () => navigation.navigate('Profile')
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось оформить подписку');
    } finally {
      setLoading(false);
    }
  };

  const stats = calculateStats();

  return (
    <ScrollView style={styles.container}>
      {/* Информация о смартфоне */}
      <View style={styles.phoneCard}>
        <Image
          style={styles.phoneImage}
          source={{ uri: phone.image || 'https://via.placeholder.com/150' }}
        />
        <View style={styles.phoneDetails}>
          <Text style={styles.phoneBrand}>{phone.brand}</Text>
          <Text style={styles.phoneModel}>{phone.model}</Text>
          <Text style={styles.phonePrice}>{phone.price.toLocaleString()} ₽</Text>
        </View>
      </View>

      {/* Выбор типа подписки */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Периодичность платежей</Text>
        <View style={styles.typeButtons}>
          {subscriptionTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                selectedType === type.id && styles.typeButtonActive
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text style={[
                styles.typeButtonText,
                selectedType === type.id && styles.typeButtonTextActive
              ]}>
                {type.name}
              </Text>
              <Text style={styles.typeDescription}>{type.description}</Text>
              <Text style={styles.typeMinAmount}>от {type.minAmount} ₽</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Выбор суммы */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Сумма платежа: {amount.toLocaleString()} ₽
        </Text>
        
        <View style={styles.amountButtons}>
          {[100, 500, 1000, 2000, 5000].map(value => (
            <TouchableOpacity
              key={value}
              style={[
                styles.amountButton,
                amount === value && styles.amountButtonActive
              ]}
              onPress={() => setAmount(value)}
            >
              <Text style={[
                styles.amountButtonText,
                amount === value && styles.amountButtonTextActive
              ]}>
                {value.toLocaleString()} ₽
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Кастомная сумма */}
        <View style={styles.customAmount}>
          <Text style={styles.customAmountLabel}>Или введите свою сумму:</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.amountInput}>{(amount || 0).toLocaleString()}</Text>
            <Text style={styles.currency}>₽</Text>
          </View>
          <View style={styles.amountSlider}>
            <View style={styles.sliderTrack}>
              <View 
                style={[
                  styles.sliderProgress,
                  { width: `${(amount / 5000) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>

      {/* Статистика */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Ваш план накопления</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.paymentsNeeded}</Text>
            <Text style={styles.statLabel}>платежей</Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.timeText}</Text>
            <Text style={styles.statLabel}>время</Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.round(stats.monthlyAmount).toLocaleString()} ₽</Text>
            <Text style={styles.statLabel}>в месяц</Text>
          </View>
        </View>
      </View>

      {/* Кнопка оформления */}
      <TouchableOpacity
        style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
        onPress={handleSubscribe}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.subscribeButtonText}>
            Оформить подписку за {amount.toLocaleString()} ₽
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
  },
  phoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phoneImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  phoneDetails: {
    flex: 1,
  },
  phoneBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  phoneModel: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 5,
  },
  phonePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 15,
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F2',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 5,
  },
  typeButtonTextActive: {
    color: '#FF6B35',
  },
  typeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  typeMinAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B35',
  },
  amountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  amountButton: {
    width: '30%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginBottom: 10,
  },
  amountButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F2',
  },
  amountButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  amountButtonTextActive: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  customAmount: {
    marginTop: 10,
  },
  customAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2D2D',
    flex: 1,
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  amountSlider: {
    marginTop: 10,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
  },
  sliderProgress: {
    height: 4,
    backgroundColor: '#FF6B35',
    borderRadius: 2,
    position: 'absolute',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  subscribeButton: {
    backgroundColor: '#FF6B35',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;
