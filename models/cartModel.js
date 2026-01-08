import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  ingredientId: mongoose.Schema.Types.ObjectId,
  name: String,
  quantity: String,
});

const cartItemSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  name: String,
  img: String,

  prices: {
    oneTime: Number,
    monthly: Number,
    weekly3_MWF: Number,
    weekly3_TTS: Number,
    weekly6: Number,
  },

  selectedOption: String,
  selectedOptionPrice: Number,
  selectedIngredients: [ingredientSchema],
  quantity: Number,
});

export default mongoose.model(
  "Cart",
  new mongoose.Schema({ userId: String, items: [cartItemSchema] })
);
