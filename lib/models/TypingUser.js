import mongoose from 'mongoose';

const typingUserSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      unique: true,
    },
    isTyping: {
      type: Boolean,
      default: false,
    },
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TypingUser || mongoose.model('TypingUser', typingUserSchema);
