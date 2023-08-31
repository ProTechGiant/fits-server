import mongoose from "mongoose";

const Schema = mongoose.Schema;
const classesSchema = new Schema(
  {
    class_name: { type: String },
    class_des: { type: String },
    class_format: { type: String },
    class_links: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    class_type: { type: String }, //in-person || live || pre-recorded
  },
  { timestamps: true }
);

export default mongoose.model("Class", classesSchema, "classes");
