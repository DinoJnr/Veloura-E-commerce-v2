const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/authmiddleware.js");

const {
  checkoutPayment,
  getAllOrders,
  updateOrderStatus,
  getPendingOrders,
  acceptOrders,
  rejectOrders,
  processGetAllOrders,
  processGetOrderById,
  processMoveToTransit,
  processSearchOrders,
  processDeleteOrder,
  transitGetAllOrders,
  transitGetOrderById,
  transitMoveToDispatched,
  transitSearchOrders,
  transitDeleteOrder,
  dispatchGetAllOrders,
  dispatchGetOrderById,
  dispatchMoveToReceived,
  dispatchSearchOrders,
  dispatchDeleteOrder,
  getReceivedOrders,
  getReceivedOrderById,
  createReceivedOrder,
  deleteReceivedOrder,
  getRejectedOrders,
  restoreRejectedOrders,
  deleteRejectedOrders,
  processRefundRejected,
  getRejectedOrdersrefund,
  staffSearchOrder,
  requestReturn,
  getPendingReturns,
  approveReturns,
  rejectReturns,
  getApprovedReturns,
  getRejectedReturns,
  settleApproved,
  getInTransitReturns,
  settleTransit,
  getReceivedReturns,
  settleReceived,
  getRefundedReturns,
} = require("../controllers/Order.controller");


router.post("/verifyorder", checkoutPayment); 




// Overview
router.get  ("/all",              protect, getAllOrders);
router.patch("/update-status/:id",protect, updateOrderStatus);
router.get  ("/staff/search",    staffSearchOrder);

// Pending
router.get ("/pending",           protect, getPendingOrders);
router.post("/accept",            acceptOrders);
router.post("/reject", protect         , rejectOrders);

// Processing
router.get   ("/processed",        protect, processGetAllOrders);
router.get   ("/processed/search", protect, processSearchOrders);
router.get   ("/processed/:id",    protect, processGetOrderById);
router.post  ("/transit",           processMoveToTransit);
router.delete("/processed/:id",    protect, processDeleteOrder);

// Transit
router.get   ("/transit",          protect, transitGetAllOrders);
router.get   ("/transit/search",   protect, transitSearchOrders);
router.get   ("/transit/:id",      protect, transitGetOrderById);
router.post  ("/dispatch",          transitMoveToDispatched);
router.delete("/transit/:id",      protect, transitDeleteOrder);

// Dispatched
router.get   ("/dispatched",        protect, dispatchGetAllOrders);
router.get   ("/dispatched/search", protect, dispatchSearchOrders);
router.get   ("/dispatched/:id",    protect, dispatchGetOrderById);
router.post  ("/received",          dispatchMoveToReceived);
router.delete("/dispatched/:id",    protect, dispatchDeleteOrder);

// Received
router.route("/received")
  .get (protect, getReceivedOrders)
  .post(protect, createReceivedOrder);
router.route("/received/:id")
  .get   (protect, getReceivedOrderById)
  .delete(protect, deleteReceivedOrder);

// Returns — logistics tracks these
router.post("/return/request",           requestReturn);
router.get ("/returns/pending",         protect, getPendingReturns);
router.post("/returns/approve",     protect ,    approveReturns);
router.post("/returns/reject",          protect, rejectReturns);
router.get ("/returns/approved",        protect, getApprovedReturns);
router.get ("/returns/rejected",        protect, getRejectedReturns);
router.get ("/returns/in-transit",      protect, getInTransitReturns);
router.get ("/returns/received",        protect, getReceivedReturns);
router.get ("/returns/refunded",        protect, getRefundedReturns);
router.post("/returns/settle-approved",  settleApproved);
router.post("/returns/settle-transit",   settleTransit);
router.post("/returns/settle-received",  settleReceived);


router.get ("/rejected",          protect, adminOnly, getRejectedOrders);
router.post("/restore-rejected",  protect, adminOnly, restoreRejectedOrders);
router.post("/delete-rejected",   protect, adminOnly, deleteRejectedOrders);
router.get ("/rejectedrefund",    protect, adminOnly, getRejectedOrdersrefund);
router.post("/refund-rejected",   protect, adminOnly, processRefundRejected);

module.exports = router;