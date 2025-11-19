import Banner from "../models/bannerModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { supabase } from "../config/supabaseClient.js";

// --------------------
// TEMP Upload Storage
// --------------------
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "tmp/"), // temp folder
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

// --------------------
// Helper: Upload to Supabase
// --------------------
const uploadToSupabase = async (filePath, originalName) => {
  const fileContent = fs.readFileSync(filePath);

  // filename inside bucket
  const fileName = `${Date.now()}_${originalName}`;

  // Upload to bucket "ads"
  const { error: uploadError } = await supabase.storage
    .from("ads")
    .upload(fileName, fileContent, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  // Public URL
  const {
    data: { publicUrl },
    error: urlError,
  } = supabase.storage.from("ads").getPublicUrl(fileName);

  if (urlError) throw urlError;

  // delete temp file
  fs.unlinkSync(filePath);

  return publicUrl;
};

// --------------------
// Get All Banners
// --------------------
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch banners", error: err.message });
  }
};

// --------------------
// Create Banner
// --------------------
export const createBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const imgUrl = await uploadToSupabase(
      req.file.path,
      req.file.originalname
    );

    const { title, link } = req.body;

    const newBanner = await Banner.create({
      title,
      link,
      imageUrl: imgUrl, // SUPABASE URL
    });

    res.status(201).json(newBanner);
  } catch (err) {
    res.status(400).json({ message: "Failed to create banner", error: err.message });
  }
};

// --------------------
// Update Banner
// --------------------
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    const { title, link } = req.body;

    if (title) banner.title = title;
    if (link) banner.link = link;

    // If new image uploaded
    if (req.file) {
      const imgUrl = await uploadToSupabase(
        req.file.path,
        req.file.originalname
      );
      banner.imageUrl = imgUrl;
    }

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: "Failed to update banner", error: err.message });
  }
};

// --------------------
// Delete Banner
// --------------------
export const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete banner", error: err.message });
  }
};
