import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// ---------------------------
// Get User Cart
// ---------------------------
export const getCart = async (req, res) => {
  try {
    const { userId } = req.query;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err });
  }
};

// ---------------------------
// Add Item to Cart
// ---------------------------
export const addToCart = async (req, res) => {
  try {
    const { userId, product } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === product._id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        desc: product.desc,
        img: product.img,
        prices: product.prices,
        selectedOption: "oneTime",
        selectedOptionPrice: product.prices.oneTime,
        quantity: 1,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to add item", error: err });
  }
};

// ---------------------------
// Remove Item
// ---------------------------
export const removeItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove product", error: err });
  }
};

// ---------------------------
// Update Option or Quantity
// ---------------------------
export const updateItem = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedOption } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ items: [] });

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) return res.json(cart);

    if (quantity !== undefined) {
      item.quantity = quantity;
    }

    if (selectedOption !== undefined) {
      item.selectedOption = selectedOption;
      item.selectedOptionPrice = item.prices[selectedOption];
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to update item", error: err });
  }
};

// ---------------------------
// Clear Cart
// ---------------------------
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    await Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });

    res.json({ items: [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart", error: err });
  }
};
