const express = require("express");
const router  = express.Router();
const upload  = require("../middleware/upload.js");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  registerUser,
  getGrossRevenue,
  getTotalOrders,
  getRecentOrders,
  getTopProducts,
  getConversionFunnel,
  getReturnRate,
  getSalesByCategory,
  getLiveAlerts,
  getPendingInquiries,
  replyToInquiry,
} = require("../controllers/Admin.controller");


router.post("/register", registerUser);


router.get ("/gross-revenue",      protect, adminOnly, getGrossRevenue);
router.get ("/total-orders",       protect, adminOnly, getTotalOrders);
router.get ("/recent-orders",      protect, adminOnly, getRecentOrders);
router.get ("/top-products",       protect, adminOnly, getTopProducts);
router.get ("/sales-by-category",  protect, adminOnly, getSalesByCategory);
router.get ("/conversion-funnel",  protect, adminOnly, getConversionFunnel);
router.get ("/return-rate",        protect, adminOnly, getReturnRate);
router.get ("/live-alerts",        protect, adminOnly, getLiveAlerts);

router.get ("/inquiries/pending",  protect, adminOnly, getPendingInquiries);
router.post("/inquiry/reply",      protect, adminOnly, upload.array("attachments", 5), replyToInquiry);

module.exports = router;