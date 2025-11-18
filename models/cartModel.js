import mongoose from "mongoose";

// Sub-schema for each item in the cart
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  img: { type: String },
  desc: { type: String },
  prices: {
    oneTime: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    weekly3_MWF: { type: Number, default: 0 },
    weekly3_TTS: { type: Number, default: 0 },
    weekly6: { type: Number, default: 0 },
  },
  selectedOption: { type: String, required: true }, // oneTime, monthly, weekly3_MWF, weekly3_TTS, weekly6
  selectedOptionPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
});

// Main Cart schema
const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
