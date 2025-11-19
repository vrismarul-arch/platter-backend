import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// Safe price fallback
const getPriceSafely = (value, fallback = 0) =>
  value !== undefined && value !== null ? value : fallback;

// Convert product.prices → flat structure for cart
const mapProductPricesToCart = (product) => {
  return {
    oneTime: getPriceSafely(product.prices.oneTime),
    monthly: getPriceSafely(product.prices.monthly),

    weekly3_MWF: getPriceSafely(product.prices.weekly3?.monWedFri),
    weekly3_TTS: getPriceSafely(product.prices.weekly3?.tueThuSat),

    weekly6: getPriceSafely(product.prices.weekly6?.monToSat),
  };
};

// ===============================
// GET USER CART
// ===============================
export const getCart = async (req, res) => {
  try {
    const { userId } = req.query;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    // Sync latest product data (name, img, desc, prices)
    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const correctedPrices = mapProductPricesToCart(product);

      item.name = product.name;
      item.desc = product.desc;

      // SUPABASE IMAGE
      item.img = product.img;  

      item.prices = correctedPrices;
      item.selectedOptionPrice =
        correctedPrices[item.selectedOption] ?? correctedPrices.oneTime;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch cart",
      error: err.message,
    });
  }
};

// ===============================
// ADD ITEM TO CART
// ===============================
export const addToCart = async (req, res) => {
  try {
    const { userId, product: prodData, optionKey = "oneTime" } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const product = await Product.findById(prodData._id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const correctedPrices = mapProductPricesToCart(product);
    const initialPrice = correctedPrices[optionKey];

    // Already exists? update qty instead
    const exists = cart.items.find(
      (item) =>
        item.productId.toString() === product._id.toString() &&
        item.selectedOption === optionKey
    );

    if (exists) {
      exists.quantity++;
      exists.prices = correctedPrices;
      exists.selectedOptionPrice = initialPrice;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        desc: product.desc,
        img: product.img, // SUPABASE IMAGE
        prices: correctedPrices,
        selectedOption: optionKey,
        selectedOptionPrice: initialPrice,
        quantity: 1,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({
      message: "Failed to add item",
      error: err.message,
    });
  }
};

// ===============================
// UPDATE CART ITEM
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
    res.status(500).json({
      message: "Failed to update item",
      error: err.message,
    });
  }
};

// ===============================
// REMOVE ITEM
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
    res.status(500).json({
      message: "Failed to remove product",
      error: err.message,
    });
  }
};

// ===============================
// CLEAR CART
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
    res.status(500).json({
      message: "Failed to clear cart",
      error: err.message,
    });
  }
};
