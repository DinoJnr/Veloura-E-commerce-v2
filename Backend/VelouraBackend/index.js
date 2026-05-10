const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
app.use(cors());
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));

// const { orderRouter } = require("./routes/Order.route");

// app.use(
//   "/order/webhook",
//   express.raw({ type: "application/json" }),
//   webhookRouter
// );

app.use(express.json());

const URI = process.env.MONGO_URI;
mongoose
  .connect(URI)
  .then(() => console.log("mongoose has been successfully connected"))
  .catch((err) => console.log("mongodb connection error", err));

const PORT = process.env.PORT || 5200;

const userRouter = require("./routes/User.route");
const adminRouter = require("./routes/Admin.route");
const uploadRouter = require("./routes/Upload.route");
const orderRouter = require("./routes/Order.route")
const transactionRoutes = require("./routes/transactionRoutes");
const settingsRoutes = require("./routes/settingsRoutes")
const authRoutes = require("./routes/Authroutes")
const adminProfileRoutes = require("./routes/AdminProfilepic")
app.use("/profile", adminProfileRoutes)
app.use("/auth" ,authRoutes)
app.use("/settings", settingsRoutes)
app.use("/transaction", transactionRoutes);
app.use("/user", userRouter);
app.use("/upload", uploadRouter);
app.use("/admin", adminRouter);
app.use("/order", orderRouter);

app.get("/ping", (req, res) => res.json({ alive: true }));
mongoose.connection.once("open", async () => {
  const collections = [
    "allorders",
    "processedorders",
    "pendingorders",
    "transitorders",
    "dispatchedorders",
    "receivedorders",
  ];

  // Drop the items subdoc unique index
  for (const col of collections) {
    try {
      await mongoose.connection.collection(col).dropIndex("items.orderId_1");
      console.log(`✅ Dropped items.orderId_1 from ${col}`);
    } catch (err) {
      console.log(`⚠️ ${col}: ${err.message}`);
    }
  }

  // Drop the top-level orderId unique index — this is what's still causing E11000
  for (const col of collections) {
    try {
      await mongoose.connection.collection(col).dropIndex("orderId_1");
      console.log(`✅ Dropped orderId_1 from ${col}`);
    } catch (err) {
      console.log(`⚠️ ${col}: ${err.message}`);
    }
  }
});
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
