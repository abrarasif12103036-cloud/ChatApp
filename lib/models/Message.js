import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    timestamp: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    replyTo: mongoose.Schema.Types.Mixed,
    reactions: mongoose.Schema.Types.Mixed,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
