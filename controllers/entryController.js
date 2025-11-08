import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";

export const addEntry = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Save to DB
    const newEntry = new Entry({ name, email, phone, message });
    await newEntry.save();

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Your Website <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Form Submitted Successfully ✅",
      text: `Hello ${name},\n\nThank you for contacting us.\nWe received your message:\n"${message}"\n\nWe will reply soon.\n\nRegards, Team`,
    });

    res.status(200).json({
      success: true,
      message: "Form submitted & Email sent ✅",
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
