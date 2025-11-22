const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phone',
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  nextPaymentDate: {
    type: Date,
    default: function() {
      const date = new Date();
      switch (this.type) {
        case 'daily':
          date.setDate(date.getDate() + 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + 1);
          break;
      }
      return date;
    }
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Метод для расчета оставшейся суммы
subscriptionSchema.methods.getRemainingAmount = function() {
  return this.phone.price - this.totalPaid;
};

// Метод для расчета прогресса
subscriptionSchema.methods.getProgress = function() {
  return (this.totalPaid / this.phone.price) * 100;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
