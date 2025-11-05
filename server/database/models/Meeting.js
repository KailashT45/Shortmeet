const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date },
  isHost: { type: Boolean, default: false },
  cameraOn: { type: Boolean, default: true },
  micOn: { type: Boolean, default: true }
});

const settingsSchema = new mongoose.Schema({
  password: { type: String },
  maxParticipants: { type: Number, default: 100 },
  recordingEnabled: { type: Boolean, default: false },
  waitingRoom: { type: Boolean, default: false },
  muteOnJoin: { type: Boolean, default: false },
  videoOnJoin: { type: Boolean, default: true },
  chatEnabled: { type: Boolean, default: true },
  screenShareEnabled: { type: Boolean, default: true }
});

const meetingSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  meetingId: { type: String, required: true, unique: true },
  roomName: { type: String, required: true },
  hostUserId: { type: String, required: true },
  hostName: { type: String, required: true },
  participants: [participantSchema],
  settings: settingsSchema,
  isActive: { type: Boolean, default: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  isInstant: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for better performance
meetingSchema.index({ isActive: 1 });
meetingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Meeting', meetingSchema);
