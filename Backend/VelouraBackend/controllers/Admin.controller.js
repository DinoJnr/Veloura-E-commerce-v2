const bcrypt = require('bcryptjs'); // Ensure this is imported
const { Admin, Logistics } = require('../models/AdminReg'); 
const ReceivedOrder = require("../models/ReceivedOrder");
const AllOrder = require("../models/AllOrder");
const Product = require("../models/Product");
const ProcessedOrder = require("../models/ProcessedOrder")
const RefundReturnOrder = require("../models/RefundReturn");
const SortedInquiry   = require("../models/SortedInquirt");   // create this model — see below
const { inquiryReplyMail } = require("../utils/inquiryReplyMail");
const PendingInquiry = require("../models/PendingInquries");

exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, role, systemId } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const salt = await bcrypt.genSalt(12);
        
        const hashedPassword = await bcrypt.hash(password, salt); 

        let newUser;
        if (role === 'admin') {
            newUser = new Admin({ fullName, email, password: hashedPassword, systemId });
        } else {
            newUser = new Logistics({ fullName, email, password: hashedPassword, systemId });
        }

        await newUser.save();
        res.status(201).json({ success: true, message: "Node Registered" });
        console.log("YEBO!!")

    } catch (error) {
        console.error("DETAILED ERROR:", error); 
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getGrossRevenue = async (req, res) => {
  try {
    const [revenueAgg] = await ReceivedOrder.aggregate([
      { $group: { _id: null, grossRevenue: { $sum: "$totalAmount" } } },
    ]);
 
    const currentYear = new Date().getFullYear();
    const monthlyAgg = await ReceivedOrder.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$orderDate" } },
          value: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);
 
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyRevenue = MONTHS.map((month, i) => {
      const found = monthlyAgg.find((m) => m._id.month === i + 1);
      return { month, value: found ? found.value : 0 };
    });
 
    res.json({
      grossRevenue: revenueAgg?.grossRevenue ?? 0,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("[getGrossRevenue]", err.message);
    res.status(500).json({ error: "Failed to fetch gross revenue" });
  }
};
 
exports.getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await AllOrder.countDocuments();
    res.json({ totalOrders });
  } catch (err) {
    console.error("[getTotalOrders]", err.message);
    res.status(500).json({ error: "Failed to fetch total orders" });
  }
};
 
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await AllOrder.find()
      .sort({ orderDate: -1 })
      .limit(20)
      .lean();

    const formatted = orders.map((o) => ({
      ...o,
      orderId: o.orderId 
        ? o.orderId 
        : `#${o._id.toString().slice(-8).toUpperCase()}`,
    }));

    res.json({ orders: formatted });
  } catch (err) {
    console.error("[getRecentOrders]", err.message);
    res.status(500).json({ error: "Failed to fetch recent orders" });
  }
};
 
exports.getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" })
      .sort({ stock: 1 })
      .limit(10)
      .lean();
 
    res.json({ products });
  } catch (err) {
    console.error("[getTopProducts]", err.message);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
};
 

exports.getConversionFunnel = async (req, res) => {
  try {
    const [totalOrders, paidOrders, processingOrders, deliveredOrders] =
      await Promise.all([
        AllOrder.countDocuments(),
        AllOrder.countDocuments({ paymentStatus: "paid" }),
        AllOrder.countDocuments({ paymentStatus: "processing" }),
        AllOrder.countDocuments({ paymentStatus: "delivered" }),
      ]);
 
    res.json({ totalOrders, paidOrders, processingOrders, deliveredOrders });
  } catch (err) {
    console.error("[getConversionFunnel]", err.message);
    res.status(500).json({ error: "Failed to fetch funnel data" });
  }
};



exports.getReturnRate = async (req, res) => {
  try {
    const [totalReceived, totalRefunds] = await Promise.all([
      ReceivedOrder.countDocuments(),
      RefundReturnOrder.countDocuments(),
    ]);

    const rate = totalReceived > 0
      ? ((totalRefunds / totalReceived) * 100).toFixed(1)
      : "0.0";

    return res.json({ rate: parseFloat(rate), totalRefunds, totalReceived });
  } catch (err) {
    console.error("getReturnRate error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getSalesByCategory = async (req, res) => {
  try {
    const result = await ReceivedOrder.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from:         "products",        
          localField:   "items.productId",
          foreignField: "_id",
          as:           "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,  
        },
      },
      {
        $group: {
          _id:     { $ifNull: ["$product.category", "Uncategorised"] },
          count:   { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$items.price", 0] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const grandTotal = result.reduce((s, d) => s + d.count, 0) || 1;

    const categories = result
      .filter((d) => d._id)
      .map((d) => ({
        name:    d._id,
        count:   d.count,
        revenue: d.revenue,
        pct:     Math.round((d.count / grandTotal) * 100),
      }));

    return res.json({ categories });
  } catch (err) {
    console.error("getSalesByCategory error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.getLiveAlerts = async (req, res) => {
  try {
    const LOW_STOCK_THRESHOLD = 10;
    const STUCK_HOURS         = 48;   
    const stuckCutoff         = new Date(Date.now() - STUCK_HOURS * 60 * 60 * 1000);

    const [lowStockProducts, stuckOrders, recentRefunds] = await Promise.all([
    
      Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
        .sort({ stock: 1 })
        .limit(3)
        .select("name stock")
        .lean(),


      ProcessedOrder.find({ createdAt: { $lt: stuckCutoff } })
        .sort({ createdAt: 1 })
        .limit(3)
        .select("orderId customer createdAt")
        .lean(),

      RefundReturnOrder.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .select("customer totalAmount createdAt")
        .lean(),
    ]);

    const alerts = [];

    lowStockProducts.forEach((p) => {
      alerts.push({
        type: p.stock <= 3 ? "warning" : "info",
        text: `${p.name} — only ${p.stock} unit${p.stock !== 1 ? "s" : ""} remaining`,
      });
    });

    stuckOrders.forEach((o) => {
      const hoursAgo = Math.round(
        (Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60)
      );
      const id         = o.orderId || o._id;
      const customerName = typeof o.customer === "object"
        ? o.customer?.fullName || o.customer?.name || "Unknown"
        : o.customer || "Unknown";
      alerts.push({
        type: "warning",
        text: `Order ${id} (${customerName}) stuck in Processing for ${hoursAgo}h`,
      });
    });


    recentRefunds.forEach((r) => {
      const name = typeof r.customer === "object"
        ? r.customer?.fullName || r.customer?.name || "A customer"
        : r.customer || "A customer";
      alerts.push({
        type: "warning",
        text: `Refund processed for ${name} — ₦${Number(r.totalAmount || 0).toLocaleString()}`,
      });
    });

    return res.json({ alerts });
  } catch (err) {
    console.error("getLiveAlerts error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getPendingInquiries = async (req, res) => {
  try {
    const inquiries = await PendingInquiry.find({ status: "Pending" })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ inquiries });
  } catch (err) {
    console.error("getPendingInquiries error:", err.message);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};


exports.getSortedInquiries = async (req, res) => {
  try {
    const inquiries = await SortedInquiry.find()
      .sort({ repliedAt: -1 })
      .lean();
    return res.json({ inquiries });
  } catch (err) {
    console.error("getSortedInquiries error:", err.message);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};


exports.replyToInquiry = async (req, res) => {
  try {
    const { to, subject, message, inquiryId } = req.body;
    const attachments = req.files || [];   

    if (!to || !message || !inquiryId) {
      return res.status(400).json({ message: "to, message, and inquiryId are required." });
    }

   
    const inquiry = await PendingInquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found." });
    }
    await inquiryReplyMail({
      to,
      subject,
      message,
      firstName:   inquiry.firstName,
      attachments,
    });
    await SortedInquiry.create({
      firstName:   inquiry.firstName,
      lastName:    inquiry.lastName,
      email:       inquiry.email,
      subject:     inquiry.subject,
      message:     inquiry.message,
      replyMessage: message,
      repliedAt:   new Date(),
    });
    await PendingInquiry.findByIdAndDelete(inquiryId);

    return res.status(200).json({ message: "Reply sent and inquiry resolved." });
  } catch (err) {
    console.error("replyToInquiry error:", err.message);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};