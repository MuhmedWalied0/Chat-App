import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "chatType",
      required: true,
    },
    chatType: {
      type: String,
      enum: ["PrivateChat", "GroupChat"],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "received", "seen"],
      default: "sent",
    },
    deleteFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isUpdated: {
      type: Boolean,
      default: false,
    },
    oldContent: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);
