const Order = require("../models/orderModel");
const { generateInvoicePDF } = require("./invoicePdfGenerator");
const generateInvoice = async (orderId) => {

    const order = await Order.findById(orderId)
        .populate("tailor");
    if (!order) {
        throw new Error("Order not found");
    }
    const pdfPath = await generateInvoicePDF(order);
    return { order, pdfPath };
};

module.exports = { generateInvoice };