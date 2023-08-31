import mongoose from "mongoose";
const Schema = mongoose.Schema;
const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema, "messages");
