import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  oneTime: { type: Number, default: 0 },      // One-Time
  threeDays: { type: Number, default: 0 },    // 3 Days
  sevenDays: { type: Number, default: 0 },    // 7 Days
  thirtyDays: { type: Number, default: 0 },   // 30 Days
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    img: { type: String, required: true },
    desc: { type: String, required: true },
    rating: { type: Number, default: 0 },
    prices: priceSchema,
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
