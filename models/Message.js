import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    // Optional: If you decide to group messages by a unique Conversation ID later
    // conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }
  },
  { timestamps: true }
);

// -------------------------------------------------------------------------
// PERFOMANCE OPTIMIZATION (Crucial for AI Feature)
// -------------------------------------------------------------------------
// 1. Compound Index for Fetching Chat History
// This allows MongoDB to jump directly to the messages between two specific users
// and instantly retrieve the last N messages without sorting the whole collection.
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

// 2. Index for the "Seen" feature (optional but good for performance)
// Helps quickly find unread messages to show notification badges
messageSchema.index({ receiverId: 1, seen: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;