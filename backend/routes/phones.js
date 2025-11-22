const express = require('express');
const Phone = require('../models/Phone');

const router = express.Router();

// Получить все смартфоны
router.get('/', async (req, res) => {
  try {
    const phones = await Phone.find({ inStock: true }).sort({ popularity: -1 });
    res.json(phones);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить смартфон по ID
router.get('/:id', async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) {
      return res.status(404).json({ message: 'Смартфон не найден' });
    }
    res.json(phone);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Поиск смартфонов
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const phones = await Phone.find({
      $or: [
        { brand: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } }
      ],
      inStock: true
    });
    res.json(phones);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить смартфоны по категории
router.get('/category/:category', async (req, res) => {
  try {
    const phones = await Phone.find({ 
      category: req.params.category,
      inStock: true 
    }).sort({ price: 1 });
    res.json(phones);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
