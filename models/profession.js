import mongoose from "mongoose";

const Schema = mongoose.Schema;
const QualificationSchema = mongoose.Schema({
  id: { type: Number },
  degree: { type: String },
  degree_note: { type: String },
});

const professionInfoSchema = new Schema(
  {
    experience_year: { type: Number },
    experience_note: { type: String },
    verification_status: { type: String, default: "pending" },
    qualification: [QualificationSchema],
    verification_process: {
      document: { type: String },
      reason: { type: String },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Profession",
  professionInfoSchema,
  "professions"
);
