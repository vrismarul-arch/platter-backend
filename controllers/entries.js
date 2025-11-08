import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";

export const addEntry = async (req, res) => {
  try {
    const data = req.body;
    data.addons = JSON.parse(data.addons || "[]");
    data.images = req.files?.map(file => file.filename) || [];

    const entry = await Entry.create(data);

    if (data.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: "Sand Art Booking Confirmation 🎉",
        html: `
        <h2>Hi ${data.name},</h2>
        <p>Your sand art booking has been received successfully!</p>
        <p>We will contact you soon to finalize the details.</p>
        <br>
        <b>Thank You 💛</b>
        `,
      });

      console.log("📨 Confirmation Email Sent to", data.email);
    }

    res.status(200).json({ message: "Booking stored & email sent ✅", entry });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};
