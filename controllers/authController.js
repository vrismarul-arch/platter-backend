import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Lead from "../models/Lead.js";

export const googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token missing" });
  }

  try {
    // 🔹 Verify Google ID Token
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );

    const { sub, email, name, picture } = response.data;

    // 🔹 Find or Create User
    let user = await User.findOne({ googleId: sub });

    if (!user) {
      user = await User.create({
        googleId: sub,
        email,
        name,
        picture,
      });
    }

    // 🔹 Save Lead (non-blocking safe)
    Lead.create({
      name,
      email,
      googleId: sub,
      picture,
      source: "Google Login",
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    }).catch(() => {});

    // 🔹 Generate App JWT
    const appToken = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ IMPORTANT RESPONSE
    return res.status(200).json({
      token: appToken,
      user,
    });
  } catch (err) {
    console.error("Google login error:", err.message);
    return res.status(401).json({ message: "Google login failed" });
  }
};
