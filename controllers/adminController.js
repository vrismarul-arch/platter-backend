import jwt from "jsonwebtoken";

export const adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { role: "admin", email: process.env.ADMIN_EMAIL },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({ token });
};

// ✔ NEW: Admin Profile API
export const getAdminProfile = (req, res) => {
  res.status(200).json({
    name:process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    role: "Admin",
  });
};
/* sds */
export const getDashboard = (req, res) => {
  res.status(200).json({ message: "Welcome to Admin Dashboard" });
};
