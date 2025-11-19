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

  // Upload to Supabase bucket
  const { error: uploadError } = await supabase.storage
    .from("ads")
    .upload(fileName, fileBuffer, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Build manual public URL
  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/ads/${fileName}`;

  // Delete temp file
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
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

/* ============================================
   GET PRODUCT BY ID
============================================ */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};

/* ============================================
   CREATE PRODUCT
============================================ */
export const createProduct = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    // Upload image
    const imgUrl = await uploadToSupabase(
      req.file.path,
      req.file.originalname
    );

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
      rating: Number(rating) || 0,
      category: category || "General",
      deliverable: deliverable !== undefined ? deliverable : true,
      img: imgUrl,

      prices: {
        oneTime: Number(oneTime) || 0,
        monthly: Number(monthly) || 0,
        weekly3: {
          monWedFri: Number(weekly3_monWedFri) || 0,
          tueThuSat: Number(weekly3_tueThuSat) || 0,
        },
        weekly6: {
          monToSat: Number(weekly6_monToSat) || 0,
        },
      },
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
};

/* ============================================
   UPDATE PRODUCT
============================================ */
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
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // Update simple fields
    if (name) product.name = name;
    if (desc) product.desc = desc;
    if (rating) product.rating = Number(rating);
    if (category) product.category = category;
    if (deliverable !== undefined) product.deliverable = deliverable;

    // If new image uploaded → upload to Supabase
    if (req.file) {
      const imgUrl = await uploadToSupabase(
        req.file.path,
        req.file.originalname
      );
      product.img = imgUrl;
    }

    // Update pricing
    if (oneTime !== undefined) product.prices.oneTime = Number(oneTime);
    if (monthly !== undefined) product.prices.monthly = Number(monthly);

    if (weekly3_monWedFri !== undefined)
      product.prices.weekly3.monWedFri = Number(weekly3_monWedFri);

    if (weekly3_tueThuSat !== undefined)
      product.prices.weekly3.tueThuSat = Number(weekly3_tueThuSat);

    if (weekly6_monToSat !== undefined)
      product.prices.weekly6.monToSat = Number(weekly6_monToSat);

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to update product", error: err.message });
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
    res.status(400).json({ message: "Failed to delete product", error: err.message });
  }
};
