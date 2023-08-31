import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const otpSchema = new Schema(
  { email: String, code: String, expireIn: Number },

  { timestamps: true }
);
// let otp = conn.model("otp", otpSchema, "otp");
export default model("Otp", otpSchema);
