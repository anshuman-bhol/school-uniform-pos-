const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        school: {
            type: String,
            default: "",
        },

        size: {
            type: String,
            default: "",
        },

        colour: {
            type: String,
            default: "",
        },

        operation: {
            type: String,
            enum: [
                "add",
                "set",
                "sale",
                "return",
            ],
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
        },

        previousStock: {
            type: Number,
            required: true,
        },

        newStock: {
            type: Number,
            required: true,
        },

        remarks: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "StockHistory",
    stockHistorySchema
);