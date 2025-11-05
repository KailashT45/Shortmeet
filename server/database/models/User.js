const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    default: 'Anonymous User'
  },
  email: String,
  lastActive: {
    type: Date,
    default: Date.now
  },
  meetingsHosted: {
    type: Number,
    default: 0
  },
  meetingsJoined: {
    type: Number,
    default: 0
  },
  totalMinutes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
