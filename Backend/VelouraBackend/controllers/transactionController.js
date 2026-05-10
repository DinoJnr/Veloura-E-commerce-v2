

const ReceivedOrder            = require("../models/ReceivedOrder");
const RefundOrderRejectedOrder = require("../models/RefundOrderRejected");
const RefundReturnOrder        = require("../models/RefundReturn");


exports.getTransactionSummary = async (req, res) => {
  try {
    const [received, rejectedRefunds, returnRefunds] = await Promise.all([
      ReceivedOrder.find().sort({ createdAt: -1 }).lean(),
      RefundOrderRejectedOrder.find().sort({ createdAt: -1 }).lean(),
      RefundReturnOrder.find().sort({ createdAt: -1 }).lean(),
    ]);


    const sumField = (arr, key) =>
      arr.reduce((acc, o) => acc + Number(o[key] || 0), 0);

    const grossedReceived        = sumField(received,        "totalAmount");
    const grossedRejectedRefunds = sumField(rejectedRefunds, "totalAmount");
    const normalizedReturnRefunds = returnRefunds.map((o) => {
      const items = Array.isArray(o.returnItems) ? o.returnItems : [];

      const calculatedFromItems = items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
        0
      );
      const resolvedTotal = calculatedFromItems > 0
        ? calculatedFromItems
        : Number(o.refundAmount || 0);

      return {
        _id:              o._id,
        orderId:          o.orderId,
        paymentReference: o.paymentReference,
        customer:         o.customer,
        items,
        totalAmount:      resolvedTotal,
        orderDate:        o.requestedAt || o.createdAt,
        createdAt:        o.createdAt,
        refundAmount:     resolvedTotal,
        returnItems:      o.returnItems,
        returnStatus:     o.returnStatus,
        reason:           o.reason,
        note:             o.note,
        refundMethod:     o.refundMethod,
        requestedAt:      o.requestedAt,
        resolvedAt:       o.resolvedAt,
      };
    });
    const grossedReturnRefunds = normalizedReturnRefunds.reduce(
      (acc, o) => acc + o.totalAmount, 0
    );
    const netRevenue = grossedReceived - grossedRejectedRefunds - grossedReturnRefunds;

    res.status(200).json({
      summary: {
        grossedReceived,
        grossedRejectedRefunds,
        grossedReturnRefunds,
        netRevenue,
        totalOrders:          received.length,
        totalRejectedRefunds: rejectedRefunds.length,
        totalReturnRefunds:   returnRefunds.length,
      },
      receipts: {
        received,
        rejectedRefunds,
        returnRefunds: normalizedReturnRefunds,
      },
    });
  } catch (err) {
    console.error("getTransactionSummary error:", err.message);
    res.status(500).json({ message: "Failed to fetch transaction summary." });
  }
};