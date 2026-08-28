const express = require("express");
const multer = require("multer");
const { uploadCatalogue, addProducts, uploadStock, updateStockManual, getProduct, getStockHistory } = require("../controllers/productController");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getProduct);
router.post("/catalogue-upload", upload.single("file"), uploadCatalogue);
router.post("/add-products", upload.single("file"), addProducts);
router.post("/stock-upload", upload.single("file"), uploadStock);
router.put("/stock/manual", updateStockManual);
router.get("/history", getStockHistory);

module.exports = router;