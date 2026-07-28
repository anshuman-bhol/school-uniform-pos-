const express = require("express");
const multer = require("multer");
const { uploadCatalogue, addProducts, uploadStock, updateStockManual, getProduct, getStockHistory } = require("../controllers/productController");
const router = express.Router();
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads/");
    },
    filename:(req,file,cb)=>{
        cb(
            null,
            Date.now() + "-" + file.originalname
        );
    }
});

const upload = multer({
    storage
});

router.get("/", getProduct);
router.post("/catalogue-upload", upload.single("file"), uploadCatalogue);
router.post("/add-products", upload.single("file"), addProducts);
router.post("/stock-upload", upload.single("file"), uploadStock);
router.put("/stock/manual", updateStockManual);
router.get("/history", getStockHistory);

module.exports = router;