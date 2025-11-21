import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true }, // e.g. "50g", "30g", "½ piece"
});

const priceSchema = new mongoose.Schema({
  oneTime: { type: Number, default: 0 },
  monthly: { type: Number, default: 0 },

  weekly3: {
    monWedFri: { type: Number, default: 0 },
    tueThuSat: { type: Number, default: 0 },
  },

  weekly6: {
    monToSat: { type: Number, default: 0 },
  },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    img: { type: String, required: true },
    desc: { type: String, required: true },
    rating: { type: Number, default: 0 },
    prices: priceSchema,

    // NEW FIELDS
    totalQuantity: { type: String, default: "" }, // Example: "200–220g"

    ingredients: [ingredientSchema], // array of ingredients
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
