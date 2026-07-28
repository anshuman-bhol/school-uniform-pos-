const express = require("express");
const router = express.Router();

const {
  generateInvoicePDF,
  sendWhatsAppInvoice
} = require("../controllers/invoiceController");

router.post("/generate-pdf", generateInvoicePDF);
router.post("/send-whatsapp", sendWhatsAppInvoice);

module.exports = router;