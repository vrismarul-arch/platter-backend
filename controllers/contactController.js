import nodemailer from "nodemailer";
import Contact from "../models/Contact.js";

export const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Save to database
    const newMessage = await Contact.create({ name, email, message });

    // Setup mail transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify mail connection
    await transporter.verify();
    console.log("✅ Mail server ready to send messages.");

    // Send mail
    const mailOptions = {
      from: `"Sandtricks Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
        <hr/>
        <small>Received: ${new Date(newMessage.createdAt).toLocaleString()}</small>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);

    res.status(200).json({ message: "✅ Message saved and email sent!" });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Failed to send message", error });
  }
};
