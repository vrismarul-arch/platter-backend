import Product from "../models/productModel.js";
import multer from "multer";
import path from "path";

// --------------------
// Multer Setup
// --------------------
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

// --------------------
// Get All Products
// --------------------
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err });
  }
};

// --------------------
// Create Product
// --------------------
export const createProduct = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required" });

    const { name, desc, rating, oneTime, threeDays, sevenDays, thirtyDays } = req.body;

    const newProduct = new Product({
      name,
      desc,
      rating: rating || 0,
      prices: {
        oneTime: oneTime || 0,
        threeDays: threeDays || 0,
        sevenDays: sevenDays || 0,
        thirtyDays: thirtyDays || 0,
      },
      img: `/uploads/${req.file.filename}`,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product", error: err });
  }
};

// --------------------
// Update Product
// --------------------
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, desc, rating, oneTime, threeDays, sevenDays, thirtyDays } = req.body;

    // Update basic fields
    if (name) product.name = name;
    if (desc) product.desc = desc;
    if (rating) product.rating = rating;

    // Update image if uploaded
    if (req.file) product.img = `/uploads/${req.file.filename}`;

    // Update prices
    product.prices.oneTime = oneTime ?? product.prices.oneTime;
    product.prices.threeDays = threeDays ?? product.prices.threeDays;
    product.prices.sevenDays = sevenDays ?? product.prices.sevenDays;
    product.prices.thirtyDays = thirtyDays ?? product.prices.thirtyDays;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to update product", error: err });
  }
};

// --------------------
// Delete Product
// --------------------
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete product", error: err });
  }
};
