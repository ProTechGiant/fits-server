const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    status: {
      type: String,
      required: false,
    },
    amount: { type: Number, default: 0 },
    recommended: { type: Boolean, default: false },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    currency: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema, "bookings");
