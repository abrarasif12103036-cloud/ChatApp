import mongoose from 'mongoose';

const onlineUserSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      default: 'online',
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

export default mongoose.models.OnlineUser || mongoose.model('OnlineUser', onlineUserSchema);
