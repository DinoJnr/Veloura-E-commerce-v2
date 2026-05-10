const express = require("express");
const router = express.Router();

const {submitInquiry} =require("../controllers/User.controller")

router.post("/inquiry", submitInquiry);

module.exports = router;