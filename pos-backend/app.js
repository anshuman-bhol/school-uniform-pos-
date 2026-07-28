const express = require("express");
const connectDB=require("./config/database")
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const createHttpError = require("http-errors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

const PORT = config.port;
connectDB();
app.use(cors({
    credentials:true,
    origin: ['http://localhost:5173']
}))
app.use(express.json());
app.use(cookieParser());

app.get("/", (req,res)=>{
    const err=createHttpError(404, "something went wrong!");
    res.json({message:"Hello from POS Server!"});
})

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"))
app.use("/api/tailor", require("./routes/tailorRoute"))
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/invoice", require("./routes/invoiceRoutes"));
app.use("/api/template", require("./routes/templateRoute"));
app.use("/api/return-exchange", require("./routes/returnExchangeRoute"));

app.use(globalErrorHandler);

app.listen(PORT, ()=> {
    console.log(`✅ POS Server is listening on port ${PORT}`);
})
