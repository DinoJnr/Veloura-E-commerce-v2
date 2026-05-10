const mongoose = require("mongoose");

const PendingInquirySchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  subject: { 
    type: String, 
    required: true,
    enum: ["General Inquiry", "Order Status", "Styling Advice", "Bespoke Request", "Press & Media"]
  },
  message: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PendingInquiry", PendingInquirySchema);