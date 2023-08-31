import mongoose from "mongoose";

const Schema = mongoose.Schema;

export const personalInfoSchema = new Schema(
  {
    name: { type: String },
    profileImage: { type: String },
    date_of_birth: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    gender: { type: String },
    phoneNumber: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Personal", personalInfoSchema, "personals");
