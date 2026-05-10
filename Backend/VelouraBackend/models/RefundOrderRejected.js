const mongoose = require('mongoose');

const RefundOrderRejectedOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: String,
      state: String,
      country: String,
    },
    items: [
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
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, },
    paymentReference: { type: String },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
module.exports = mongoose.model('RefundOrderRejectedOrder', RefundOrderRejectedOrderSchema);