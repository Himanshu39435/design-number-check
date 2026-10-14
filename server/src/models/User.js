import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'customer', 'staff'],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
