const Product = require("../models/productModel");
const StockHistory = require("../models/stockHistoryModel");
const createHttpError = require("http-errors");

const updateStock = async ({
    itemId,
    size = "",
    colour = "",
    quantity,
    operation,
    remarks = "",
}) => {

    const category = await Product.findOne({
        "items._id": itemId,
    });

    if (!category) {
        throw createHttpError(404, "Product not found.");
    }

    const item = category.items.id(itemId);

    if (!item) {
        throw createHttpError(404, "Item not found.");
    }

    const variant = item.variants.find(
        (v) =>
            v.size === size &&
            (v.color || "").trim().toLowerCase() ===
            (colour || "").trim().toLowerCase()
    );

    if (!variant) {
        throw createHttpError(404, "Variant not found.");
    }

    const previousStock = variant.stock;
    if (quantity <= 0) {
        throw createHttpError(
            400,
            "Invalid quantity."
        );
    }

    switch (operation) {

        case "sale":

            if (variant.stock < quantity) {
                throw createHttpError(
                    400,
                    `${item.name} has insufficient stock`
                );
            }

            variant.stock -= quantity;

            break;

        case "return":

            variant.stock += quantity;

            break;

        default:

            throw createHttpError(
                400,
                "Invalid stock operation."
            );

    }

    const newStock = variant.stock;

    await category.save();

    await StockHistory.create({

        productName: item.name,
        category: category.category,
        school: item.school || "",
        size,
        colour,
        operation,
        quantity,
        previousStock,
        newStock,
        remarks,

    });
};

module.exports = updateStock;