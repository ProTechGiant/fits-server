import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ServicesOfferedSchema = mongoose.Schema({
  value: { type: String },
  key: { type: String },
});
const userSchema = new Schema(
  {
    email: { type: String },
    password: { type: String },
    role: { type: String, default: "trainee" },
    fitness_level: {
      value: { type: Number },
      key: { type: String },
    },
    fitness_goal: {
      value: { type: String },
      key: { type: String },
    },
    services_offered: {
      value: { type: String },
      key: { type: String },
    },
    isVerified: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    suspended: { type: Boolean, default: false },
    reset_password: { type: Boolean, default: false },
    trainerVerified: { type: String, default: "pending" },
    accountVerified: { type: String, default: "pending" }, //  suspend || active || deleted
    numReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    profession: { type: mongoose.Schema.Types.ObjectId, ref: "Profession" },
    personal: { type: mongoose.Schema.Types.ObjectId, ref: "Personal" },
    cardCreated: { type: Boolean, default: false },
    cus_id: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema, "users");
