const Product = require("../models/productModel");
const StockHistory = require("../models/stockHistoryModel");
const createHttpError = require("http-errors");

const deductStock = async (order) => {

    for (const orderItem of order.items) {

        // Tailoring items don't have stock
        if (orderItem.itemType !== "ReadyMade") {
            continue;
        }

        const category = await Product.findOne({
            "items._id": orderItem.itemId,
        });
        if (!category) {
            throw createHttpError(
                404,
                `${orderItem.name} not found in catalogue`
            );
        }

        const item = category.items.id(orderItem.itemId);
        if (!item) {
            throw createHttpError(
                404,
                `${orderItem.name} not found in catalogue`
            );
        }

        const variant = item.variants.find(
            (v) =>
                v.size === orderItem.size &&
                (v.color || "") === (orderItem.colour || "")
        );
        if (!variant) {
            throw createHttpError(
                404,
                `${orderItem.name} not found in catalogue`
            );
        }

        const previousStock = variant.stock;
        if (previousStock < orderItem.quantity) {
            throw createHttpError(
                400,
                `${orderItem.name} has insufficient stock`
            );
        }

        variant.stock -= orderItem.quantity;
        const newStock = variant.stock;
        await category.save();
        await StockHistory.create({
            productName: item.name,
            category: category.category,
            school: item.school || "",
            size: orderItem.size || "",
            colour: orderItem.colour || "",
            operation: "sale",
            quantity: orderItem.quantity,
            previousStock,
            newStock,
            remarks: `Invoice #${orderItem.invoiceNumber || ""}`,
        });
    }

};

module.exports = deductStock;