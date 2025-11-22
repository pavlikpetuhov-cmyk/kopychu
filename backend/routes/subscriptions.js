const express = require('express');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Phone = require('../models/Phone');

const router = express.Router();

// Создать подписку
router.post('/', async (req, res) => {
  try {
    const { userId, phoneId, subscriptionType, amount } = req.body;

    // Проверяем существование пользователя и телефона
    const user = await User.findById(userId);
    const phone = await Phone.findById(phoneId);

    if (!user || !phone) {
      return res.status(404).json({ message: 'Пользователь или смартфон не найден' });
    }

    // Создаем подписку
    const subscription = new Subscription({
      user: userId,
      phone: phoneId,
      type: subscriptionType,
      amount: amount
    });

    await subscription.save();

    // Обновляем пользователя
    user.subscription = {
      type: subscriptionType,
      amount: amount,
      targetPhone: phoneId,
      nextPayment: subscription.nextPaymentDate
    };
    await user.save();

    res.status(201).json({
      message: 'Подписка создана успешно',
      subscription: subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить подписки пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.params.userId })
      .populate('phone')
      .sort({ createdAt: -1 });
    
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить подписку
router.put('/:id', async (req, res) => {
  try {
    const { type, amount } = req.body;
    
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { type, amount },
      { new: true }
    ).populate('phone');

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Отменить подписку
router.delete('/:id', async (req, res) => {
  try {
    await Subscription.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: 'Подписка отменена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
