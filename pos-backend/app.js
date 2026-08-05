const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authenticate = require("./middlewares/auth");
const authorizeRoles = require("./middlewares/authorizeRoles");

const app = express();
const PORT = config.port;

connectDB();

app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:5173", "https://school-uniform-pos.vercel.app"],
    })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", authenticate, authorizeRoles("admin"), (req, res) => {
    res.status(200).json({ success: true, message: "Welcome, admin" });
});

app.use("/api/admin", authenticate, authorizeRoles("admin"), require("./routes/adminRoutes"));
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/tailor", require("./routes/tailorRoute"));
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/invoice", require("./routes/invoiceRoutes"));
app.use("/api/template", require("./routes/templateRoute"));
app.use("/api/return-exchange", require("./routes/returnExchangeRoute"));
app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`✅ POS Server is listening on port ${PORT}`);
});
