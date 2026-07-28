const { generateInvoice } = require("../services/invoicePdfService");
const { uploadMedia, sendDocument } = require("../services/whatsappService");
const Order = require("../models/orderModel");

const generateInvoicePDF = async (req, res) => {
    try {
        const { orderId } = req.body;
        const result = await generateInvoice(orderId);
        res.status(200).json({
            success: true,
            pdfPath: result.pdfPath
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const sendWhatsAppInvoice = async (req, res) => {
    console.log("Received orderId:", req.body.orderId);
    try {

        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        // Generate PDF
        const result = await generateInvoice(orderId);
        const pdfPath = result.pdfPath;

        // Upload PDF to WhatsApp
        const mediaId = await uploadMedia(pdfPath);
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("Customer phone in DB:", order.customerDetails.phone);

        const phone = `91${order.customerDetails.phone}`;

        console.log("Phone sent to Meta:", phone);
        console.log("Media ID:", mediaId);
        const response = await sendDocument(phone, mediaId);

        console.log("Meta Response:", response);
        return res.status(200).json({
            success: true,
            message: "Invoice sent successfully via WhatsApp.",
            mediaId,
            response
        });

    } catch (error) {

        console.error("Whatsapp Error:");

        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        return res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
};

module.exports = { generateInvoicePDF, sendWhatsAppInvoice };