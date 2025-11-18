import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// Helper: safely get price
const getPriceSafely = (value, fallback = 0) => {
  return value !== undefined && value !== null ? value : fallback;
};

// Helper: map product prices to cart item structure
const mapProductPricesToCart = (product) => {
  return {
    oneTime: getPriceSafely(product.prices.oneTime),
    monthly: getPriceSafely(product.prices.monthly),
    weekly3_MWF: getPriceSafely(product.prices.weekly3?.monWedFri),
    weekly3_TTS: getPriceSafely(product.prices.weekly3?.tueThuSat),
    weekly6:
      typeof product.prices.weekly6 === "object"
        ? getPriceSafely(product.prices.weekly6.monToSat)
        : getPriceSafely(product.prices.weekly6),
  };
};

// ===============================
// Get User Cart
// ===============================
export const getCart = async (req, res) => {
  try {
    const { userId } = req.query;
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const correctedPrices = mapProductPricesToCart(product);
      item.prices = correctedPrices;
      item.selectedOptionPrice =
        correctedPrices[item.selectedOption] ?? correctedPrices.oneTime;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
};

// ===============================
// Add Item to Cart
// ===============================
export const addToCart = async (req, res) => {
  try {
    const { userId, product: prodData, optionKey = "oneTime" } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const product = await Product.findById(prodData._id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const correctedPrices = mapProductPricesToCart(product);
    const initialPrice = correctedPrices[optionKey] ?? correctedPrices.oneTime;

    const exists = cart.items.find(
      (item) =>
        item.productId.toString() === product._id.toString() &&
        item.selectedOption === optionKey
    );

    if (exists) {
      exists.quantity += 1;
      exists.selectedOptionPrice = initialPrice;
      exists.prices = correctedPrices;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        desc: product.desc,
        img: product.img,
        prices: correctedPrices,
        selectedOption: optionKey,
        selectedOptionPrice: initialPrice,
        quantity: 1,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to add item", error: err.message });
  }
};

// ===============================
// Update Item (quantity / option)
// ===============================
export const updateItem = async (req, res) => {
  try {
    const { userId, _id, quantity, selectedOption } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ items: [] });

    const item = cart.items.find((i) => i._id.toString() === _id);
    if (!item) return res.json(cart);

    if (quantity !== undefined) item.quantity = quantity;

    if (selectedOption) {
      const product = await Product.findById(item.productId);
      if (product) {
        const correctedPrices = mapProductPricesToCart(product);
        item.selectedOption = selectedOption;
        item.selectedOptionPrice =
          correctedPrices[selectedOption] ?? correctedPrices.oneTime;
        item.prices = correctedPrices;
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to update item", error: err.message });
  }
};

// ===============================
// Remove Item
// ===============================
export const removeItem = async (req, res) => {
  try {
    const { userId, _id } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter((item) => item._id.toString() !== _id);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove product", error: err.message });
  }
};

// ===============================
// Clear Cart
// ===============================
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart", error: err.message });
  }
};
