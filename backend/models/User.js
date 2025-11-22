const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  balance: {
    type: Number,
    default: 0
  },
  subscription: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: null
    },
    amount: {
      type: Number,
      default: 0
    },
    nextPayment: {
      type: Date,
      default: null
    },
    targetPhone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Phone',
      default: null
    }
  },
  achievements: [{
    name: String,
    progress: Number,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  totalInvested: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Виртуальное поле для прогресса
userSchema.virtual('progress').get(function() {
  if (!this.subscription.targetPhone) return 0;
  // Прогресс будет рассчитываться относительно цены телефона
  return (this.balance / this.subscription.targetPhone.price) * 100;
});

module.exports = mongoose.model('User', userSchema);
