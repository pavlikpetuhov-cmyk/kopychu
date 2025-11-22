import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import axios from 'axios';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // В реальном приложении брать ID пользователя из контекста/стора
      const userId = 'current-user-id';
      
      // Загружаем данные пользователя и подписки
      const [userResponse, subscriptionsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${userId}`),
        axios.get(`http://localhost:5000/api/subscriptions/user/${userId}`)
      ]);

      setUser(userResponse.data);
      setSubscriptions(subscriptionsResponse.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const calculateProgress = (subscription) => {
    if (!subscription.phone) return 0;
    return (subscription.totalPaid / subscription.phone.price) * 100;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getNextPaymentText = (subscription) => {
    if (!subscription.nextPaymentDate) return 'Не установлено';
    
    const nextPayment = new Date(subscription.nextPaymentDate);
    const today = new Date();
    const diffTime = nextPayment - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    return `Через ${diffDays} дней`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF6B35']}
        />
      }
    >
      {/* Шапка профиля */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Баланс и прогресс */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Накопленная сумма</Text>
        <Text style={styles.balanceAmount}>
          {user?.balance?.toLocaleString() || 0} ₽
        </Text>
        
        {subscriptions.length > 0 && (
          <>
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>Прогресс</Text>
                <Text style={styles.progressPercent}>
                  {Math.round(calculateProgress(subscriptions[0]))}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${calculateProgress(subscriptions[0])}%` }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.targetInfo}>
              <Text style={styles.targetText}>
                Цель: {subscriptions[0]?.phone?.brand} {subscriptions[0]?.phone?.model}
              </Text>
              <Text style={styles.targetPrice}>
                {subscriptions[0]?.phone?.price?.toLocaleString()} ₽
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Активные подписки */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Активные подписки</Text>
        
        {subscriptions.length === 0 ? (
          <View style={styles.emptySubscriptions}>
            <Text style={styles.emptyText}>Нет активных подписок</Text>
            <TouchableOpacity 
              style={styles.findPhoneButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.findPhoneButtonText}>Найти смартфон</Text>
            </TouchableOpacity>
          </View>
        ) : (
          subscriptions.map(subscription => (
            <View key={subscription._id} style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <Text style={styles.phoneName}>
                  {subscription.phone.brand} {subscription.phone.model}
                </Text>
                <Text style={styles.subscriptionStatus}>
                  {subscription.status === 'active' ? 'Активна' : 'Приостановлена'}
                </Text>
              </View>
              
              <View style={styles.subscriptionProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${calculateProgress(subscription)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {subscription.totalPaid?.toLocaleString()} ₽ / {subscription.phone.price?.toLocaleString()} ₽
                </Text>
              </View>

              <View style={styles.subscriptionDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Периодичность</Text>
                  <Text style={styles.detailValue}>
                    {subscription.type === 'daily' ? 'Ежедневно' : 
                     subscription.type === 'weekly' ? 'Еженедельно' : 'Ежемесячно'}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Сумма платежа</Text>
                  <Text style={styles.detailValue}>
                    {subscription.amount?.toLocaleString()} ₽
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Следующий платеж</Text>
                  <Text style={styles.detailValue}>
                    {getNextPaymentText(subscription)}
                  </Text>
                </View>
              </View>

              <View style={styles.subscriptionActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Изменить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.pauseButton]}>
                  <Text style={[styles.actionButtonText, styles.pauseButtonText]}>
                    Приостановить
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Достижения */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Достижения</Text>
        <View style={styles.achievementsGrid}>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🔥</Text>
            <Text style={styles.achievementTitle}>Первый платеж</Text>
            <Text style={styles.achievementStatus}>Завершено</Text>
          </View>
          
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>💪</Text>
            <Text style={styles.achievementTitle}>25% от цели</Text>
            <Text style={styles.achievementStatus}>
              {subscriptions[0] && calculateProgress(subscriptions[0]) >= 25 ? 'Завершено' : `${Math.round(calculateProgress(subscriptions[0]))}%`}
            </Text>
          </View>
          
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🚀</Text>
            <Text style={styles.achievementTitle}>50% от цели</Text>
            <Text style={styles.achievementStatus}>
              {subscriptions[0] && calculateProgress(subscriptions[0]) >= 50 ? 'Завершено' : `${Math.round(calculateProgress(subscriptions[0]))}%`}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  targetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetText: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  targetPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
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
  emptySubscriptions: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  findPhoneButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  findPhoneButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subscriptionCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  phoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  subscriptionStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  subscriptionProgress: {
    marginBottom: 15,
  },
  subscriptionDetails: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D2D2D',
  },
  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B35',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#FF6B35',
    fontWeight: '500',
  },
  pauseButton: {
    borderColor: '#666',
  },
  pauseButtonText: {
    color: '#666',
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  achievementTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#2D2D2D',
    marginBottom: 5,
  },
  achievementStatus: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '500',
  },
});

export default ProfileScreen;
