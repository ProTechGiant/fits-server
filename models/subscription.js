const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    video_links: {
      type: Array,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Subscription",
  subscriptionSchema,
  "subscriptions"
);
