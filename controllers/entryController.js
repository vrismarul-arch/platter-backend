import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";

export const addEntry = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debug

    const { eventType, name, date, venue, audizeSize, duration, addOns, contactName, contactEmail, contactPhone } = req.body;

    if (!eventType || !contactEmail) {
      return res.status(400).json({ success: false, message: "Event type and contact email are required" });
    }

    const newEntry = new Entry({ eventType, name, date, venue, audizeSize, duration, addOns, contactName, contactEmail, contactPhone });
    await newEntry.save();

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: contactEmail,
      subject: "Sand Art Event Booking ✅",
      text: `Hello ${contactName},\n\nYour Sand Art Event has been booked successfully!\n\nDetails:\nEvent: ${name}\nType: ${eventType}\nDate: ${date}\nVenue: ${venue}\nAudience: ${audizeSize}\nDuration: ${duration}\nAdd-ons: ${Object.keys(addOns).filter(k => addOns[k]).join(", ") || "None"}`
    });

    res.json({ success: true, message: "Saved & Email Sent ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
