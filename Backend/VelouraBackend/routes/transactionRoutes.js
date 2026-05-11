// routes/transactionRoutes.js

const express = require("express");
const router  = express.Router();
const { getTransactionSummary } = require("../controllers/transactionController");
const { protect, adminOnly }    = require("../middleware/authmiddleware.js");

router.get("/summary", protect, adminOnly, getTransactionSummary);

module.exports = router;