import Entry from "../models/Entry.js";
import transporter from "../config/transporter.js"; // Import transporter

export const addEntry = async (req, res) => {
  try {
    const data = req.body;

    // Save entry to DB
    const entry = await Entry.create({
      eventType: data.eventType,
      name: data.name,
      date: data.date,
      venue: data.venue,
      audizeSize: data.audizeSize,
      duration: data.duration,
      addOns: data.addOns,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    });

    // Send confirmation email if email exists
    if (data.contactEmail) {
      await transporter.sendMail({
        from: `"Sand Art" <${process.env.EMAIL_USER}>`,
        to: data.contactEmail,
        subject: "Sand Art Booking Confirmation 🎉",
        html: `
          <h2>Hi ${data.contactName},</h2>
          <p>Your sand art booking has been received successfully!</p>
          <p>We will contact you soon to finalize the details.</p>
          <br>
          <b>Thank You 💛</b>
        `,
      });
      console.log("📨 Confirmation Email Sent to", data.contactEmail);
    }

    res.status(200).json({ success: true, message: "Booking stored & email sent ✅", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
};
