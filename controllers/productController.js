import Product from "../models/productModel.js";
import multer from "multer";
import path from "path";

// -------------------- Multer Setup --------------------
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

// -------------------- Get All Products --------------------
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// -------------------- Get Product By ID --------------------
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};

// -------------------- Create Product --------------------
export const createProduct = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const {
      name,
      desc,
      rating,
      category,
      deliverable,
      oneTime,
      monthly,
      weekly3_monWedFri,
      weekly3_tueThuSat,
      weekly6_monToSat,
    } = req.body;

    const product = await Product.create({
      name,
      desc,
      rating: rating || 0,
      category: category || "General",
      deliverable: deliverable !== undefined ? deliverable : true,
      img: `/uploads/${req.file.filename}`,
      prices: {
        oneTime: Number(oneTime) || 0,
        monthly: Number(monthly) || 0,
        weekly3: {
          monWedFri: Number(weekly3_monWedFri) || 0,
          tueThuSat: Number(weekly3_tueThuSat) || 0,
        },
        weekly6: {
          monToSat: Number(weekly6_monToSat) || 0, // ⚡ Correct object format
        },
      },
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
};

// -------------------- Update Product --------------------
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      desc,
      rating,
      category,
      deliverable,
      oneTime,
      monthly,
      weekly3_monWedFri,
      weekly3_tueThuSat,
      weekly6_monToSat,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name) product.name = name;
    if (desc) product.desc = desc;
    if (rating) product.rating = rating;
    if (category) product.category = category;
    if (deliverable !== undefined) product.deliverable = deliverable;
    if (req.file) product.img = `/uploads/${req.file.filename}`;

    // Update prices safely
    product.prices.oneTime = oneTime !== undefined ? Number(oneTime) : product.prices.oneTime;
    product.prices.monthly = monthly !== undefined ? Number(monthly) : product.prices.monthly;

    if (product.prices.weekly3) {
      product.prices.weekly3.monWedFri = weekly3_monWedFri !== undefined
        ? Number(weekly3_monWedFri)
        : product.prices.weekly3.monWedFri;

      product.prices.weekly3.tueThuSat = weekly3_tueThuSat !== undefined
        ? Number(weekly3_tueThuSat)
        : product.prices.weekly3.tueThuSat;
    }

    // ⚡ Weekly6 object
    product.prices.weekly6.monToSat = weekly6_monToSat !== undefined
      ? Number(weekly6_monToSat)
      : product.prices.weekly6.monToSat;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to update", error: err.message });
  }
};

// -------------------- Delete Product --------------------
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete product", error: err.message });
  }
};
