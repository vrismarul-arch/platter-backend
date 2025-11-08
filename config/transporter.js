import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,          // SSL port
  secure: true,       // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail or Workspace email
    pass: process.env.EMAIL_PASS, // App password or email password
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

// Optional: Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});

export default transporter;
