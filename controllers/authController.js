import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Lead from "../models/Lead.js";

export const googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ message: "Token missing" });

  try {
    // Verify token with Google
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );

    const { sub, email, name, picture } = response.data;

    // Find or create user
    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = new User({ googleId: sub, email, name, picture });
      await user.save();
    }

    // 🟦 Save Lead Entry
    await Lead.create({
      name,
      email,
      googleId: sub,
      picture,
      source: "Google Login",
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    // Generate Token
    const appToken = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token: appToken, user });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: "Google login failed" });
  }
};
