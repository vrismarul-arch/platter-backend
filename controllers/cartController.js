import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

/* ================= HELPERS ================= */

const safeNumber = (val, fallback = 0) =>
  val !== undefined && val !== null ? val : fallback;

const mapProductPricesToCart = (product) => ({
  oneTime: safeNumber(product.prices?.oneTime),
  monthly: safeNumber(product.prices?.monthly),
  weekly3_MWF: safeNumber(product.prices?.weekly3?.monWedFri),
  weekly3_TTS: safeNumber(product.prices?.weekly3?.tueThuSat),
  weekly6: safeNumber(product.prices?.weekly6?.monToSat),
});

const sameIngredients = (a = [], b = []) =>
  JSON.stringify(a) === JSON.stringify(b);

/* ================= GET CART ================= */

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const prices = mapProductPricesToCart(product);

      item.name = product.name;
      item.desc = product.desc;
      item.img = product.img;
      item.prices = prices;
      item.selectedOptionPrice =
        prices[item.selectedOption] ?? prices.oneTime;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to load cart" });
  }
};

/* ================= ADD TO CART ================= */

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      productId,
      selectedOption = "oneTime",
      selectedIngredients = [],
      quantity = 1,
    } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const prices = mapProductPricesToCart(product);
    const selectedPrice = prices[selectedOption] ?? prices.oneTime;

    const exists = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedOption === selectedOption &&
        sameIngredients(item.selectedIngredients, selectedIngredients)
    );

    if (exists) {
      exists.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        desc: product.desc,
        img: product.img,
        prices,
        selectedOption,
        selectedOptionPrice: selectedPrice,
        selectedIngredients,
        quantity,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to add item" });
  }
};

/* ================= UPDATE ITEM ================= */

export const updateItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { _id, quantity, selectedOption } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json(cart);

    const item = cart.items.id(_id);
    if (!item) return res.json(cart);

    if (quantity !== undefined) item.quantity = quantity;

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
    res.status(500).json({ message: "Failed to update item" });
  }
};

/* ================= REMOVE ITEM ================= */

export const removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { _id } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json(cart);

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== _id
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};

/* ================= CLEAR CART ================= */

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    );

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
