const PendingInquiry = require("../models/PendingInquries");

exports.submitInquiry = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const inquiry = await PendingInquiry.create({
      firstName,
      lastName,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      message: "Inquiry received successfully.",
      inquiry,
    });
  } catch (err) {
    console.error("submitInquiry error:", err.message);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};