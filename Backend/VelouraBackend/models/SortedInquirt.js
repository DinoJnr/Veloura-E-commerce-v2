const mongoose = require("mongoose");

const SortedInquirySchema = new mongoose.Schema({
  // Original Inquiry Data
  originalId: { type: mongoose.Schema.Types.ObjectId, ref: "PendingInquiry" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  
  // Resolution Data
  replyMessage: { type: String, required: true }, // The message sent back to the user
  adminRepliedBy: { type: String }, // Optional: Name of the staff who replied
  repliedAt: { type: Date, default: Date.now },
  status: { type: String, default: "Resolved" }
});

module.exports = mongoose.model("SortedInquiry", SortedInquirySchema);