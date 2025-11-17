import jwt from "jsonwebtoken";

// ===============================
// 🔐  USER PROTECT MIDDLEWARE
// ===============================
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, Not authorized!" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    console.error("Protect Error:", err.message);
    res.status(401).json({ message: "Invalid or expired token!" });
  }
};

// ===============================
// 🔐  ADMIN ONLY MIDDLEWARE
// ===============================
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required!" });
  }
  next();
};

// ===============================
// 🔐  NORMAL AUTH (FOR USERS ONLY)
// ===============================
export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
