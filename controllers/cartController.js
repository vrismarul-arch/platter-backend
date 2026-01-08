import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

/* ======================================
   HELPERS
====================================== */

// Safe number fallback
const safeNumber = (val, fallback = 0) =>
  val !== undefined && val !== null ? val : fallback;

// Convert product.prices → flat cart prices
const mapProductPricesToCart = (product) => ({
  oneTime: safeNumber(product.prices?.oneTime),
  monthly: safeNumber(product.prices?.monthly),

  weekly3_MWF: safeNumber(product.prices?.weekly3?.monWedFri),
  weekly3_TTS: safeNumber(product.prices?.weekly3?.tueThuSat),

  weekly6: safeNumber(product.prices?.weekly6?.monToSat),
});

// Compare ingredient arrays safely
const sameIngredients = (a = [], b = []) =>
  JSON.stringify(a) === JSON.stringify(b);

/* ======================================
   GET USER CART
====================================== */
export const getCart = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) return res.json({ items: [] });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    // Sync latest product info
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const correctedPrices = mapProductPricesToCart(product);

      item.name = product.name;
      item.desc = product.desc;
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

/* ======================================
   ADD ITEM TO CART
====================================== */
export const addToCart = async (req, res) => {
  try {
    const {
      userId,
      product: prodData,
      optionKey = "oneTime",
      selectedIngredients = [],
    } = req.body;

    if (!userId)
      return res.status(401).json({ message: "User not logged in" });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const product = await Product.findById(prodData._id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const prices = mapProductPricesToCart(product);
    const selectedPrice = prices[optionKey] ?? prices.oneTime;

    // Check for existing item (same product + same plan + same ingredients)
    const exists = cart.items.find(
      (item) =>
        item.productId.toString() === product._id.toString() &&
        item.selectedOption === optionKey &&
        sameIngredients(item.selectedIngredients, selectedIngredients)
    );

    if (exists) {
      exists.quantity += 1;
      exists.selectedOptionPrice = selectedPrice;
      exists.prices = prices;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        desc: product.desc,
        img: product.img,
        prices,
        selectedOption: optionKey,
        selectedOptionPrice: selectedPrice,
        selectedIngredients,
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

/* ======================================
   UPDATE ITEM (QTY / PRICE PLAN)
====================================== */
export const updateItem = async (req, res) => {
  try {
    const { userId, _id, quantity, selectedOption } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ items: [] });

    const item = cart.items.find((i) => i._id.toString() === _id);
    if (!item) return res.json(cart);

    if (quantity !== undefined) {
      item.quantity = quantity;
    }

    if (selectedOption) {
      const product = await Product.findById(item.productId);
      if (product) {
        const prices = mapProductPricesToCart(product);
        item.selectedOption = selectedOption;
        item.selectedOptionPrice =
          prices[selectedOption] ?? prices.oneTime;
        item.prices = prices;
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

/* ======================================
   REMOVE ITEM
====================================== */
export const removeItem = async (req, res) => {
  try {
    const { userId, _id } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== _id
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({
      message: "Failed to remove item",
      error: err.message,
    });
  }
};

/* ======================================
   CLEAR CART
====================================== */
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
