import Product from "../models/productModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { supabase } from "../config/supabaseClient.js";

/* ============================================
   MULTER — TEMP STORAGE
============================================ */
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "tmp/"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

/* ============================================
   HELPER — UPLOAD FILE TO SUPABASE
============================================ */
const uploadToSupabase = async (filePath, originalName) => {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = `${Date.now()}_${originalName}`;

  const { error: uploadError } = await supabase.storage
    .from("ads")
    .upload(fileName, fileBuffer, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/ads/${fileName}`;

  fs.unlinkSync(filePath);

  return publicUrl;
};

/* ============================================
   GET ALL PRODUCTS
============================================ */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};

/* ============================================
   GET PRODUCT BY ID
============================================ */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format (avoid CastError)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: err.message,
    });
  }
};

/* ============================================
   CREATE PRODUCT
============================================ */
export const createProduct = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    // Upload image to Supabase
    const imgUrl = await uploadToSupabase(
      req.file.path,
      req.file.originalname
    );

    // PARSE JSON FIELDS
    let ingredients = [];
    try {
      ingredients = JSON.parse(req.body.ingredients || "[]");
    } catch {
      ingredients = [];
    }

    const product = await Product.create({
      name: req.body.name,
      desc: req.body.desc,
      rating: Number(req.body.rating) || 0,
      img: imgUrl,

      // NEW FIELDS
      totalQuantity: req.body.totalQuantity || "",
      ingredients,

      // PRICES
      prices: {
        oneTime: Number(req.body.oneTime) || 0,
        monthly: Number(req.body.monthly) || 0,

        weekly3: {
          monWedFri: Number(req.body.weekly3_monWedFri) || 0,
          tueThuSat: Number(req.body.weekly3_tueThuSat) || 0,
        },

        weekly6: {
          monToSat: Number(req.body.weekly6_monToSat) || 0,
        },
      },
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({
      message: "Error creating product",
      error: err.message,
    });
  }
};

/* ============================================
   UPDATE PRODUCT
============================================ */
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // BASIC FIELDS
    if (req.body.name) product.name = req.body.name;
    if (req.body.desc) product.desc = req.body.desc;
    if (req.body.rating !== undefined)
      product.rating = Number(req.body.rating);

    // NEW FIELDS
    if (req.body.totalQuantity)
      product.totalQuantity = req.body.totalQuantity;

    // INGREDIENTS JSON
    if (req.body.ingredients) {
      try {
        product.ingredients = JSON.parse(req.body.ingredients);
      } catch {
        product.ingredients = [];
      }
    }

    // NEW IMAGE?
    if (req.file) {
      const imgUrl = await uploadToSupabase(
        req.file.path,
        req.file.originalname
      );
      product.img = imgUrl;
    }

    // PRICES
    if (req.body.oneTime !== undefined)
      product.prices.oneTime = Number(req.body.oneTime);

    if (req.body.monthly !== undefined)
      product.prices.monthly = Number(req.body.monthly);

    if (req.body.weekly3_monWedFri !== undefined)
      product.prices.weekly3.monWedFri = Number(
        req.body.weekly3_monWedFri
      );

    if (req.body.weekly3_tueThuSat !== undefined)
      product.prices.weekly3.tueThuSat = Number(
        req.body.weekly3_tueThuSat
      );

    if (req.body.weekly6_monToSat !== undefined)
      product.prices.weekly6.monToSat = Number(
        req.body.weekly6_monToSat
      );

    await product.save();

    res.json(product);
  } catch (err) {
    res.status(400).json({
      message: "Failed to update product",
      error: err.message,
    });
  }
};

/* ============================================
   DELETE PRODUCT
============================================ */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({
      message: "Failed to delete product",
      error: err.message,
    });
  }
};
