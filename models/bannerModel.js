import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String },
    imageUrl: { type: String, required: true },
    mobileImageUrl: { type: String },
    link: { type: String },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
