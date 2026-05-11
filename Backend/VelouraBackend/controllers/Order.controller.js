const crypto = require("crypto");
const Product = require("../models/Product");
const AllOrder = require("../models/AllOrder");
const PendingOrder = require("../models/PendingOrder");
const TransitOrder = require("../models/TransitOrder")
const ReceivedOrder = require("../models/ReceivedOrder");
const ProcessedOrder = require("../models/ProcessedOrder")
const DispatchedOrder = require("../models/DispatchedOrder");
const RefundOrderRejectedOrder = require("../models/RefundOrderRejected");
const PendingReturnOrder = require("../models/PendingReturn");
const ApproveReturnOrder = require("../models/ApproveReturn");
const RejectedReturnPendingOrder = require("../models/RejectedReturnPending");
const TransitReturnOrder   = require("../models/ReturnTransit");
const ReturnReceivedOrder  = require("../models/ReturnReceived");
const RefundReturnOrder = require("../models/RefundReturn");
const RejectedPendingOrder = require("../models/RejectedPending");

const {refundRejectedOrderPaymentMail} = require("../utils/Refundrejectedorderpaymentmail");
const { sendOrderConfirmationEmail } = require("../utils/SendConfirmOrder");
const {orderInTransitMail} = require("../utils/Orderintransitmail");
const {orderAcceptedMail} = require("../utils/Orderacceptedmail");
const {orderDispatchedMail} = require("../utils/Orderdispatchedmail");
const {orderReceivedMail} = require("../utils/Orderreceivedmail");
const { orderRestoredMail } = require("../utils/Orderrestoredmail");
const {orderRejectedMail} = require("../utils/orderrejectedmail");

const { returnPendingMail }   = require("../utils/returnpendingmail");
const { returnApprovedMail }  = require("../utils/returnapprovedmail");
const { returnRejectedMail }  = require("../utils/returnrejectedmail");
const { returnInTransitMail } = require("../utils/returnintransitmail");
const { returnReceivedMail }  = require("../utils/returnreceivedmail");
const { returnRefundedMail }  = require("../utils/returnrefundedmail");

exports.checkoutPayment = async (req, res) => {
  try {
    const { reference, formData, cartItems, totalAmount, status } = req.body;
    const orderId = cartItems?.[0]?.orderId;

    if (!reference) {
      return res.status(400).json({ success: false, message: "No reference provided" });
    }

    const existing = await AllOrder.findOne({ paymentReference: reference });
    if (existing) {
      return res.status(200).json({ success: true, message: "Order tracking already initialized" });
    }

    const newOrderData = {
      orderId,
      customer: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
      },
      items: cartItems.map(({ orderId, ...rest }) => rest),
      totalAmount,
      paymentStatus: status,
      paymentReference: reference,
    };

    await AllOrder.create(newOrderData);
    await PendingOrder.create(newOrderData);

    const stockUpdates = cartItems.map(async (item) => {
      try {
        const qty = item.qty || item.quantity || 1;
        const updatedProduct = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -qty } },
          { new: true }
        );
        if (!updatedProduct) return;
        if (updatedProduct.stock < 0) {
          await Product.findByIdAndUpdate(item.productId, { stock: 0 });
        }
      } catch (err) {
        console.error(`Stock update failed for ${item.name}:`, err.message);
      }
    });
    await Promise.all(stockUpdates);

    res.status(200).json({
      success: true,
      message: "Order recorded. Waiting for payment verification...",
    });
  } catch (error) {
    console.error("CHECKOUT ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await AllOrder.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ success: false, message: "No status provided" });
    }

    const updated = await AllOrder.findByIdAndUpdate(id, { paymentStatus }, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order: updated });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await PendingOrder.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("GET PENDING ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.acceptOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "orderIds must be a non-empty array." });
    }

    const results = { succeeded: [], failed: [] };

    for (const id of orderIds) {
      try {
        const order = await PendingOrder.findById(id);
        if (!order) {
          results.failed.push({ id, reason: "Order not found in pending collection." });
          continue;
        }

        await ProcessedOrder.findOneAndUpdate(
          { orderId: order.orderId },
          { ...order.toObject(), paymentStatus: "Accept", processedAt: new Date() },
          { upsert: true, returnDocument: "after" }
        );

        await PendingOrder.findByIdAndDelete(id);

        try {
          await orderAcceptedMail(order);
        } catch (mailError) {
          console.error(`Email failed for order ${order.orderId}:`, mailError.message);
        }

        results.succeeded.push(id);
      } catch (err) {
        console.error(`Process failed for ${id}:`, err.message);
        results.failed.push({ id, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.succeeded.length} order(s) accepted successfully.`,
      results,
    });
  } catch (error) {
    console.error("ACCEPT ORDER SYSTEM ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error during order processing." });
  }
};

exports.rejectOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "orderIds must be a non-empty array." });
    }

    const results = { succeeded: [], failed: [] };

    for (const id of orderIds) {
      try {
        const order = await PendingOrder.findById(id);
        if (!order) {
          results.failed.push({ id, reason: "Order not found in pending collection." });
          continue;
        }

        if (order.items && order.items.length > 0) {
          const restockPromises = order.items.map(async (item) => {
            if (item.productId) {
              await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.qty || item.quantity || 1 } },
                { returnDocument: "after" }
              );
            }
          });
          await Promise.all(restockPromises);
        }

        const doc = order.toObject();
        delete doc._id;
        delete doc.__v;

        await RejectedPendingOrder.findOneAndUpdate(
          { orderId: order.orderId },
          { ...doc, rejectedAt: new Date() },
          { upsert: true, returnDocument: "after" }
        );

        await PendingOrder.findByIdAndDelete(id);

        try {
          await orderRejectedMail(doc);
        } catch (mailError) {
          console.error(`Email failed for rejected order ${order.orderId}:`, mailError.message);
        }

        results.succeeded.push(id);
      } catch (err) {
        console.error(`Rejection process failed for ${id}:`, err.message);
        results.failed.push({ id, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.succeeded.length} order(s) rejected and restocked successfully.`,
      results,
    });
  } catch (error) {
    console.error("REJECT SYSTEM ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error during rejection processing." });
  }
};

exports.getRejectedOrders = async (req, res) => {
  try {
    const orders = await RejectedPendingOrder.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("[getRejectedOrders]", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch rejected orders." });
  }
};

exports.restoreRejectedOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "orderIds must be a non-empty array." });
    }

    const results = { succeeded: [], failed: [] };

    for (const id of orderIds) {
      try {
        const order = await RejectedPendingOrder.findById(id);
        if (!order) {
          results.failed.push({ id, reason: "Order not found in rejected collection." });
          continue;
        }

        const alreadyPending = await PendingOrder.findOne({ orderId: order.orderId });
        if (alreadyPending) {
          results.failed.push({ id: order.orderId, reason: "Order already exists in Pending flow." });
          continue;
        }

        const doc = order.toObject();
        delete doc._id;
        delete doc.__v;

        await PendingOrder.create(doc);
        await RejectedPendingOrder.findByIdAndDelete(id);

        try {
          await orderRestoredMail(order);
        } catch (mailError) {
          console.error(`Email failed for order ${order.orderId}:`, mailError.message);
        }

        results.succeeded.push(id);
      } catch (err) {
        console.error(`Process failed for ${id}:`, err.message);
        results.failed.push({ id, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.succeeded.length} order(s) restored successfully.`,
      results,
    });
  } catch (error) {
    console.error("[restoreRejectedOrders] System Error:", error.message);
    res.status(500).json({ success: false, message: "Server error during order restoration." });
  }
};

exports.deleteRejectedOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "No order IDs provided." });
    }

    const result = await RejectedPendingOrder.deleteMany({ _id: { $in: orderIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} order(s) permanently deleted.`,
    });
  } catch (err) {
    console.error("[deleteRejectedOrders]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.processGetAllOrders = async (req, res) => {
  try {
    const orders = await ProcessedOrder.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("processGetAllOrders error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch processed orders." });
  }
};

exports.processGetOrderById = async (req, res) => {
  try {
    const order = await ProcessedOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("processGetOrderById error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch order." });
  }
};

exports.processMoveToTransit = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "orderIds must be a non-empty array." });
    }

    const results = { succeeded: [], failed: [] };

    for (const id of orderIds) {
      try {
        const order = await ProcessedOrder.findById(id);
        if (!order) {
          results.failed.push({ id, reason: "Order not found in processed collection." });
          continue;
        }

        const alreadyInTransit = await TransitOrder.findOne({ orderId: order.orderId });
        if (alreadyInTransit) {
          results.failed.push({ id: order.orderId, reason: "Order already in transit flow." });
          continue;
        }

        const doc = order.toObject();
        delete doc._id;
        delete doc.__v;

        await TransitOrder.create(doc);
        await ProcessedOrder.findByIdAndDelete(id);

        try {
          await orderInTransitMail(doc);
        } catch (mailError) {
          console.error(`Email failed for order ${order.orderId}:`, mailError.message);
        }

        results.succeeded.push(id);
      } catch (err) {
        console.error(`Process failed for ${id}:`, err.message);
        results.failed.push({ id, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.succeeded.length} order(s) moved to transit successfully.`,
      results,
    });
  } catch (error) {
    console.error("MOVE TO TRANSIT SYSTEM ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error during transit processing." });
  }
};

exports.processSearchOrders = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Search query is required." });

    const orders = await ProcessedOrder.find({
      $or: [
        { "customer.fullName": { $regex: q, $options: "i" } },
        { orderId: { $regex: q, $options: "i" } },
        { paymentReference: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("processSearchOrders error:", err.message);
    res.status(500).json({ success: false, message: "Search failed." });
  }
};

exports.processDeleteOrder = async (req, res) => {
  try {
    const deleted = await ProcessedOrder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Order not found." });
    res.status(200).json({ success: true, message: "Order deleted." });
  } catch (err) {
    console.error("processDeleteOrder error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete order." });
  }
};

exports.transitGetAllOrders = async (req, res) => {
  try {
    const orders = await TransitOrder.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("transitGetAllOrders error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch transit orders." });
  }
};

exports.transitGetOrderById = async (req, res) => {
  try {
    const order = await TransitOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("transitGetOrderById error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch order." });
  }
};

exports.transitMoveToDispatched = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "orderIds must be a non-empty array." });
    }

    const results = { succeeded: [], failed: [] };

    for (const id of orderIds) {
      try {
        const order = await TransitOrder.findById(id);
        if (!order) {
          results.failed.push({ id, reason: "Order not found in transit collection." });
          continue;
        }

        const alreadyDispatched = await DispatchedOrder.findOne({ orderId: order.orderId });
        if (alreadyDispatched) {
          results.failed.push({ id: order.orderId, reason: "Order already in dispatched flow." });
          continue;
        }

        const doc = order.toObject();
        delete doc._id;
        delete doc.__v;

        await DispatchedOrder.create(doc);
        await TransitOrder.findByIdAndDelete(id);

        try {
          await orderDispatchedMail(doc);
        } catch (mailError) {
          console.error(`Email failed for order ${order.orderId}:`, mailError.message);
        }

        results.succeeded.push(id);
      } catch (err) {
        console.error(`Dispatch process failed for ${id}:`, err.message);
        results.failed.push({ id, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.succeeded.length} order(s) moved to dispatched successfully.`,
      results,
    });
  } catch (error) {
    console.error("DISPATCH SYSTEM ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error during dispatch processing." });
  }
};

exports.transitSearchOrders = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Search query is required." });

    const orders = await TransitOrder.find({
      $or: [
        { "customer.fullName": { $regex: q, $options: "i" } },
        { orderId: { $regex: q, $options: "i" } },
        { paymentReference: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("transitSearchOrders error:", err.message);
    res.status(500).json({ success: false, message: "Search failed." });
  }
};

exports.transitDeleteOrder = async (req, res) => {
  try {
    const deleted = await TransitOrder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Order not found." });
    res.status(200).json({ success: true, message: "Order deleted." });
  } catch (err) {
    console.error("transitDeleteOrder error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete order." });
  }
};

exports.dispatchGetAllOrders = async (req, res) => {
  try {
    const orders = await DispatchedOrder.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("dispatchGetAllOrders error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch dispatched orders." });
  }
};

exports.dispatchGetOrderById = async (req, res) => {
  try {
    const order = await DispatchedOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("dispatchGetOrderById error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch order." });
  }
};

exports.dispatchMoveToReceived = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "orderIds must be a non-empty array." });
    }

    const results = { succeeded: [], failed: [] };

    for (const id of orderIds) {
      try {
        const order = await DispatchedOrder.findById(id);
        if (!order) {
          results.failed.push({ id, reason: "Order not found in dispatched collection." });
          continue;
        }

        const alreadyReceived = await ReceivedOrder.findOne({ orderId: order.orderId });
        if (alreadyReceived) {
          results.failed.push({ id: order.orderId, reason: "Order already marked as received." });
          continue;
        }

        const doc = order.toObject();
        delete doc._id;
        delete doc.__v;

        await ReceivedOrder.create(doc);
        await DispatchedOrder.findByIdAndDelete(id);

        try {
          await orderReceivedMail(doc);
        } catch (mailError) {
          console.error(`Email failed for order ${order.orderId}:`, mailError.message);
        }

        results.succeeded.push(id);
      } catch (err) {
        console.error(`Process failed for ID ${id}:`, err.message);
        results.failed.push({ id, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.succeeded.length} order(s) successfully marked as received.`,
      results,
    });
  } catch (error) {
    console.error("RECEIVED STATUS SYSTEM ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error during receipt processing." });
  }
};

exports.dispatchSearchOrders = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Search query is required." });

    const orders = await DispatchedOrder.find({
      $or: [
        { "customer.fullName": { $regex: q, $options: "i" } },
        { orderId: { $regex: q, $options: "i" } },
        { paymentReference: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("dispatchSearchOrders error:", err.message);
    res.status(500).json({ success: false, message: "Search failed." });
  }
};

exports.dispatchDeleteOrder = async (req, res) => {
  try {
    const deleted = await DispatchedOrder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Order not found." });
    res.status(200).json({ success: true, message: "Order deleted." });
  } catch (err) {
    console.error("dispatchDeleteOrder error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete order." });
  }
};

exports.getReceivedOrders = async (req, res) => {
  try {
    const orders = await ReceivedOrder.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error("[getReceivedOrders]", err.message);
    return res.status(500).json({ success: false, message: "Server error fetching received orders." });
  }
};

exports.getReceivedOrderById = async (req, res) => {
  try {
    const order = await ReceivedOrder.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Received order not found." });
    }
    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("[getReceivedOrderById]", err.message);
    return res.status(500).json({ success: false, message: "Server error fetching order." });
  }
};

exports.createReceivedOrder = async (req, res) => {
  try {
    const { customer, items, totalAmount, paymentStatus, paymentReference, orderDate } = req.body;

    if (!customer || !items?.length || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "customer, items, and totalAmount are required.",
      });
    }

    const orderId = `VEL-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const newOrder = await ReceivedOrder.create({
      orderId,
      customer,
      items,
      totalAmount,
      paymentStatus: paymentStatus || "Paid",
      paymentReference: paymentReference || null,
      orderDate: orderDate || new Date(),
      receivedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Received order created successfully.",
      order: newOrder,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate order entry. Please retry." });
    }
    console.error("[createReceivedOrder]", err.message);
    return res.status(500).json({ success: false, message: "Server error creating received order." });
  }
};

exports.deleteReceivedOrder = async (req, res) => {
  try {
    const order = await ReceivedOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Received order not found." });
    }
    return res.status(200).json({ success: true, message: "Received order deleted." });
  } catch (err) {
    console.error("[deleteReceivedOrder]", err.message);
    return res.status(500).json({ success: false, message: "Server error deleting order." });
  }
};

exports.processRefundRejected = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "orderIds must be a non-empty array." });
    }

    const results = { succeeded: [], failed: [] };

    for (const id of orderIds) {
      try {
        const order = await RejectedPendingOrder.findById(id);
        if (!order) {
          results.failed.push({ id, reason: "Order not found in rejected collection." });
          continue;
        }

        await RefundOrderRejectedOrder.findOneAndUpdate(
          { orderId: order.orderId },
          { ...order.toObject(), archivedAt: new Date() },
          { upsert: true, new: true }
        );

        await RejectedPendingOrder.findByIdAndDelete(id);

        try {
          await refundRejectedOrderPaymentMail(order);
        } catch (mailError) {
          console.error(`Email failed for order ${order.orderId}:`, mailError.message);
        }

        results.succeeded.push(id);
      } catch (err) {
        console.error(`Process failed for ${id}:`, err.message);
        results.failed.push({ id, reason: err.message });
      }
    }

    res.status(200).json({
      message: `${results.succeeded.length} refund(s) processed successfully.`,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during refund processing." });
  }
};

exports.getRejectedOrdersrefund = async (req, res) => {
  try {
    const orders = await RejectedPendingOrder.find().sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error("getRejectedOrders error:", err.message);
    res.status(500).json({ message: "Failed to fetch rejected orders." });
  }
};

exports.staffSearchOrder = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    const raw = q.trim().replace(/^#?ORD-?/i, "");
    const regex = new RegExp(raw, "i");
    const isValidId = raw.match(/^[a-f\d]{24}$/i);

    const [
      processed, transit, dispatched, received,
      retApproved, retTransit, retReceived, refunded
    ] = await Promise.all([
      ProcessedOrder.findOne({ $or: [{ orderId: regex }, { _id: isValidId ? raw : undefined }].filter(Boolean) }).lean(),
      TransitOrder.findOne({ $or: [{ orderId: regex }, { _id: isValidId ? raw : undefined }].filter(Boolean) }).lean(),
      DispatchedOrder.findOne({ $or: [{ orderId: regex }, { _id: isValidId ? raw : undefined }].filter(Boolean) }).lean(),
      ReceivedOrder.findOne({ $or: [{ orderId: regex }, { _id: isValidId ? raw : undefined }].filter(Boolean) }).lean(),
      ApproveReturnOrder.findOne({ $or: [{ orderId: regex }, { _id: isValidId ? raw : undefined }].filter(Boolean) }).lean(),
      TransitReturnOrder.findOne({ $or: [{ orderId: regex }, { _id: isValidId ? raw : undefined }].filter(Boolean) }).lean(),
      ReturnReceivedOrder.findOne({ $or: [{ orderId: regex }, { _id: isValidId ? raw : undefined }].filter(Boolean) }).lean(),
      RefundReturnOrder.findOne({ $or: [{ orderId: regex }, { _id: isValidId ? raw : undefined }].filter(Boolean) }).lean(),
    ]);

    if (refunded)    return res.json({ order: refunded,    stage: 7, stageLabel: "refunded" });
    if (retReceived) return res.json({ order: retReceived, stage: 6, stageLabel: "return_received" });
    if (retTransit)  return res.json({ order: retTransit,  stage: 5, stageLabel: "return_transit" });
    if (retApproved) return res.json({ order: retApproved, stage: 4, stageLabel: "return_approved" });
    if (received)    return res.json({ order: received,    stage: 3, stageLabel: "received" });
    if (dispatched)  return res.json({ order: dispatched,  stage: 2, stageLabel: "dispatched" });
    if (transit)     return res.json({ order: transit,     stage: 1, stageLabel: "transit" });
    if (processed)   return res.json({ order: processed,   stage: 0, stageLabel: "processed" });

    return res.status(404).json({ message: "Order not found" });
  } catch (err) {
    console.error("staffSearchOrder error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const returnRecord = await PendingReturnOrder.create(req.body);

    try {
      await returnPendingMail(returnRecord);
    } catch (mailError) {
      console.error("Return Pending Email failed:", mailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Return request submitted successfully.",
      returnId: returnRecord._id,
      status: returnRecord.returnStatus,
    });
  } catch (error) {
    console.error("RETURN REQUEST ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPendingReturns = async (req, res) => {
  try {
    const returns = await PendingReturnOrder.find().sort({ requestedAt: -1 });
    res.status(200).json({ returns });
  } catch (error) {
    console.error("FETCH RETURNS ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.approveReturns = async (req, res) => {
  try {
    const { returnIds } = req.body;

    if (!Array.isArray(returnIds) || returnIds.length === 0) {
      return res.status(400).json({ success: false, message: "returnIds must be a non-empty array." });
    }

    const results = { succeeded: [], failed: [] };

    for (const id of returnIds) {
      try {
        const record = await PendingReturnOrder.findById(id);
        if (!record) {
          results.failed.push({ id, reason: "Return record not found." });
          continue;
        }

        const doc = record.toObject();
        delete doc._id;
        delete doc.__v;

        await ApproveReturnOrder.findOneAndUpdate(
          { orderId: doc.orderId },
          { ...doc, returnStatus: "Approved", resolvedAt: new Date() },
          { upsert: true, returnDocument: "after" }
        );
        await PendingReturnOrder.findByIdAndDelete(id);
        await ReceivedOrder.findOneAndDelete({ orderId: doc.orderId });

        try {
          await returnApprovedMail(doc);
        } catch (mailError) {
          console.error(`Email failed for return ${doc.orderId}:`, mailError.message);
        }

        results.succeeded.push(id);
      } catch (err) {
        console.error(`Approval failed for ID ${id}:`, err.message);
        results.failed.push({ id, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.succeeded.length} return(s) approved.`,
      results,
    });
  } catch (error) {
    console.error("APPROVE RETURN SYSTEM ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error during approval." });
  }
};

exports.rejectReturns = async (req, res) => {
  try {
    const { returnIds } = req.body;

    if (!Array.isArray(returnIds) || returnIds.length === 0) {
      return res.status(400).json({ success: false, message: "returnIds must be a non-empty array." });
    }

    const results = { succeeded: [], failed: [] };

    for (const id of returnIds) {
      try {
        const record = await PendingReturnOrder.findById(id);
        if (!record) {
          results.failed.push({ id, reason: "Return record not found." });
          continue;
        }

        const doc = record.toObject();
        delete doc._id;
        delete doc.__v;

        await RejectedReturnPendingOrder.findOneAndUpdate(
          { orderId: doc.orderId },
          { ...doc, returnStatus: "Rejected", resolvedAt: new Date() },
          { upsert: true, returnDocument: "after" }
        );
        await PendingReturnOrder.findByIdAndDelete(id);

        try {
          await returnRejectedMail(doc);
        } catch (mailError) {
          console.error(`Email failed for rejected return ${doc.orderId}:`, mailError.message);
        }

        results.succeeded.push(id);
      } catch (err) {
        console.error(`Rejection failed for ID ${id}:`, err.message);
        results.failed.push({ id, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.succeeded.length} return(s) rejected.`,
      results,
    });
  } catch (error) {
    console.error("REJECT RETURN SYSTEM ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error during rejection." });
  }
};

exports.getApprovedReturns = async (req, res) => {
  try {
    const returns = await ApproveReturnOrder.find().sort({ resolvedAt: -1 });
    res.status(200).json({ returns });
  } catch (error) {
    console.error("FETCH APPROVED RETURNS ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRejectedReturns = async (req, res) => {
  try {
    const returns = await RejectedReturnPendingOrder.find().sort({ resolvedAt: -1 });
    res.status(200).json({ returns });
  } catch (error) {
    console.error("FETCH REJECTED RETURNS ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.settleApproved = async (req, res) => {
  const { returnId } = req.body;

  if (!returnId) {
    return res.status(400).json({ success: false, message: "returnId is required." });
  }

  try {
    const approved = await ApproveReturnOrder.findById(returnId);
    if (!approved) {
      return res.status(404).json({ success: false, message: "Approved return not found." });
    }

    const doc = approved.toObject();
    delete doc._id;
    delete doc.__v;

    const transit = await TransitReturnOrder.create({
      ...doc,
      returnStatus: "In Transit",
      resolvedAt: new Date(),
    });

    await ApproveReturnOrder.findByIdAndDelete(returnId);

    try {
      await returnInTransitMail(transit);
    } catch (mailError) {
      console.error(`Email failed for return transit ${doc.orderId}:`, mailError.message);
    }

    return res.status(201).json({ success: true, message: "Return moved to In Transit successfully.", transit });
  } catch (err) {
    console.error("settleApproved error:", err.message);
    return res.status(500).json({ success: false, message: "Server error during return settlement.", error: err.message });
  }
};

exports.getInTransitReturns = async (req, res) => {
  try {
    const returns = await TransitReturnOrder.find({ returnStatus: "In Transit" }).sort({ createdAt: -1 });
    return res.status(200).json({ returns });
  } catch (err) {
    console.error("getInTransitReturns error:", err.message);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

exports.settleTransit = async (req, res) => {
  const { returnId } = req.body;

  if (!returnId) {
    return res.status(400).json({ success: false, message: "returnId is required." });
  }

  try {
    const transit = await TransitReturnOrder.findById(returnId);
    if (!transit) {
      return res.status(404).json({ success: false, message: "In-transit return not found." });
    }

    const doc = transit.toObject();
    delete doc._id;
    delete doc.__v;

    const received = await ReturnReceivedOrder.create({
      ...doc,
      returnStatus: "Received",
      resolvedAt: new Date(),
    });

    await TransitReturnOrder.findByIdAndDelete(returnId);

    try {
      await returnReceivedMail(received);
    } catch (mailError) {
      console.error(`Email failed for received return ${doc.orderId}:`, mailError.message);
    }

    return res.status(201).json({ success: true, message: "Return marked as Received successfully.", received });
  } catch (err) {
    console.error("settleTransit error:", err.message);
    return res.status(500).json({ success: false, message: "Server error during return receipt processing.", error: err.message });
  }
};

exports.getReceivedReturns = async (req, res) => {
  try {
    const returns = await ReturnReceivedOrder.find({ returnStatus: "Received" }).sort({ createdAt: -1 });
    return res.status(200).json({ returns });
  } catch (err) {
    console.error("getReceivedReturns error:", err.message);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

exports.settleReceived = async (req, res) => {
  const { returnId } = req.body;

  if (!returnId) {
    return res.status(400).json({ success: false, message: "returnId is required." });
  }

  try {
    const received = await ReturnReceivedOrder.findById(returnId);
    if (!received) {
      return res.status(404).json({ success: false, message: "Received return not found." });
    }

    const doc = received.toObject();
    delete doc._id;
    delete doc.__v;

    const refunded = await RefundReturnOrder.create({
      ...doc,
      returnStatus: "Refunded",
      resolvedAt: new Date(),
    });

    await ReturnReceivedOrder.findByIdAndDelete(returnId);

    try {
      await returnRefundedMail(refunded);
    } catch (mailError) {
      console.error(`Email failed for refunded order ${doc.orderId}:`, mailError.message);
    }

    return res.status(201).json({ success: true, message: "Return marked as Refunded successfully.", refunded });
  } catch (err) {
    console.error("settleReceived error:", err.message);
    return res.status(500).json({ success: false, message: "Server error during refund processing.", error: err.message });
  }
};

exports.getRefundedReturns = async (req, res) => {
  try {
    const returns = await RefundReturnOrder.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ returns });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};