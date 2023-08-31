
const mongoose = require("mongoose");
import { personalInfoSchema } from "./personal";

const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    reviewFor: { type: String },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    trainee: personalInfoSchema, // Embed trainee subdocument
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    role: { type: String },
    alreadyReview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema, "reviews");
