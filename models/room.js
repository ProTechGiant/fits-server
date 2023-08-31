import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {

    linkUser: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      image: { type: String },
      name: { type: String },

    },
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      image: { type: String },
      name: { type: String },
    },

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", roomSchema, "rooms");
