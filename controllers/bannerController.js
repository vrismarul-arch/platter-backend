import Banner from "../models/bannerModel.js";
import multer from "multer";
import path from "path";

// --------------------
// Multer Setup
// --------------------
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

// --------------------
// Get All Banners
// --------------------
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch banners", error: err });
  }
};

// --------------------
// Create Banner
// --------------------
export const createBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const { title, link } = req.body;

    const newBanner = new Banner({
      title,
      link,
      imageUrl: `/uploads/${req.file.filename}`,
    });

    await newBanner.save();
    res.status(201).json(newBanner);
  } catch (err) {
    res.status(400).json({ message: "Failed to create banner", error: err });
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
    if (req.file) banner.imageUrl = `/uploads/${req.file.filename}`;

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: "Failed to update banner", error: err });
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
    res.status(400).json({ message: "Failed to delete banner", error: err });
  }
};
