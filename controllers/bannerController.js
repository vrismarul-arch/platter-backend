import Banner from "../models/bannerModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { supabase } from "../config/supabaseClient.js";

/* --------------------------------------------
   MULTER — ACCEPT DESKTOP + MOBILE IMAGES
--------------------------------------------- */
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "tmp/"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  }),
}).fields([
  { name: "desktop", maxCount: 1 },
  { name: "mobile", maxCount: 1 },
]);

/* --------------------------------------------
   UPLOAD FILE TO SUPABASE
--------------------------------------------- */
const uploadToSupabase = async (filePath, originalName) => {
  const fileContent = fs.readFileSync(filePath);
  const fileName = `${Date.now()}_${originalName}`;

  const { error: uploadError } = await supabase.storage
    .from("ads")
    .upload(fileName, fileContent, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
    error: urlError,
  } = supabase.storage.from("ads").getPublicUrl(fileName);

  if (urlError) throw urlError;

  fs.unlinkSync(filePath);
  return publicUrl;
};

/* --------------------------------------------
   GET ALL BANNERS
--------------------------------------------- */
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch banners",
      error: err.message,
    });
  }
};

/* --------------------------------------------
   CREATE BANNER (desktop + mobile)
--------------------------------------------- */
export const createBanner = async (req, res) => {
  try {
    const desktop = req.files.desktop?.[0];
    const mobile = req.files.mobile?.[0];

    if (!desktop)
      return res.status(400).json({ message: "Desktop image required" });

    const desktopUrl = await uploadToSupabase(
      desktop.path,
      desktop.originalname
    );

    const mobileUrl = mobile
      ? await uploadToSupabase(mobile.path, mobile.originalname)
      : null;

    const { title, link } = req.body;

    const banner = await Banner.create({
      title,
      link,
      imageUrl: desktopUrl,
      mobileImageUrl: mobileUrl,
    });

    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create banner",
      error: err.message,
    });
  }
};

/* --------------------------------------------
   UPDATE BANNER
--------------------------------------------- */
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner)
      return res.status(404).json({ message: "Banner not found" });

    const { title, link } = req.body;

    if (title) banner.title = title;
    if (link) banner.link = link;

    /* -----------------------------
       UPDATE ONLY IF NEW FILE SENT
    ------------------------------ */

    // Desktop Image Update
    if (req.files?.desktop?.[0]) {
      const desktopFile = req.files.desktop[0];
      const newDesktopUrl = await uploadToSupabase(
        desktopFile.path,
        desktopFile.originalname
      );
      banner.imageUrl = newDesktopUrl; // REPLACE DESKTOP IMAGE
    }

    // Mobile Image Update
    if (req.files?.mobile?.[0]) {
      const mobileFile = req.files.mobile[0];
      const newMobileUrl = await uploadToSupabase(
        mobileFile.path,
        mobileFile.originalname
      );
      banner.mobileImageUrl = newMobileUrl; // REPLACE MOBILE IMAGE
    }

    await banner.save();

    res.json({
      message: "Banner updated successfully",
      banner,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update banner",
      error: err.message,
    });
  }
};

/* --------------------------------------------
   DELETE BANNER
--------------------------------------------- */
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    res.status(400).json({
      message: "Failed to delete banner",
      error: err.message,
    });
  }
};
