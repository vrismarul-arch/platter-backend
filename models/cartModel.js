import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  img: String,
  desc: String,

  prices: {
    oneTime: Number,
    threeDays: Number,
    sevenDays: Number,
    thirtyDays: Number,
  },

  selectedOption: { type: String, default: "oneTime" },
  selectedOptionPrice: { type: Number, default: 0 },

  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [cartItemSchema],
});

export default mongoose.model("Cart", cartSchema);
