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
  <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: #000000; padding: 25px; text-align: center;">
              <h1 style="color: #fbbc05; margin: 0; font-size: 26px;">Sand Art Booking Confirmation</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 24px;">
              <p>Hi <b>${data.contactName}</b>,</p>
              <p>Thank you for booking a Sand Art show with us! 🎉</p>
              <p>We have successfully received your enquiry and our team will get in touch with you shortly to finalize the event details.</p>
              
              <!-- Event Summary Box -->
              <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #fbbc05; margin-top: 20px;">
                <p style="margin: 0;"><b>Event Details:</b></p>
                <p style="margin: 5px 0;">Event Type: <b>${data.eventType}</b></p>
                <p style="margin: 5px 0;">Date: <b>${data.date}</b></p>
                <p style="margin: 5px 0;">Venue: <b>${data.venue}</b></p>
                <p style="margin: 5px 0;">Audience Size: <b>${data.audizeSize}</b></p>
                <p style="margin: 5px 0;">Duration: <b>${data.duration}</b></p>
              </div>

              <p style="margin-top: 30px;">If you have any questions or need changes, just reply to this email. We're here to help 😊</p>
              <p><b>Thank You! 💛</b><br>Sand Art Team</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #000000; text-align: center; padding: 20px; color: #ffffff; font-size: 14px;">
              © ${new Date().getFullYear()} Sand Art. All Rights Reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
`

      });
      console.log("📨 Confirmation Email Sent to", data.contactEmail);
    }

    res.status(200).json({ success: true, message: "Booking stored & email sent ✅", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
};
