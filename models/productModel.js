import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  oneTime: { type: Number, default: 0 },
  monthly: { type: Number, default: 0 },

  weekly3: {
    monWedFri: { type: Number, default: 0 },   // M-W-F
    tueThuSat: { type: Number, default: 0 },   // T-TH-S
  },

  weekly6: {
    monToSat: { type: Number, default: 0 },    // ONLY VALID (Sun removed)
  }
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

export default mongoose.model("Product", productSchema);
