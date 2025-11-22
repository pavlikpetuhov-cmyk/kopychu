const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  specifications: {
    storage: String,
    ram: String,
    screen: String,
    camera: String,
    battery: String,
    processor: String
  },
  category: {
    type: String,
    enum: ['flagship', 'midrange', 'budget'],
    default: 'midrange'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Индекс для поиска
phoneSchema.index({ brand: 1, model: 1 });

module.exports = mongoose.model('Phone', phoneSchema);
