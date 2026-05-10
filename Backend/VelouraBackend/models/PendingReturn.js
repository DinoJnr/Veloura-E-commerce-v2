const mongoose = require("mongoose");

const PendingReturnOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    paymentReference: { type: String },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: String,
      state: String,
      country: String,
    },
    returnItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        qty: Number,
        size: String,
        color: String,
        image: String,
      },
    ],
    reason: { type: String, required: true },
    note: { type: String, default: "" },
    returnStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "In Transit", "Received", "Refunded"],
      default: "Pending",
    },
    refundAmount: { type: Number, default: 0 },
    refundMethod: { type: String },
    requestedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PendingReturnOrder", PendingReturnOrderSchema);