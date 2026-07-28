const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        name: {
            type: String,
            required: true,
        },

        itemType: {
            type: String,
            enum: ["ReadyMade", "Tailoring"],
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

        quantity: {
            type: Number,
            required: true,
        },

        pricePerQuantity: {
            type: Number,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const returnExchangeSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        invoiceNumber: {
            type: String,
            required: true,
        },

        returnNumber: {
            type: String,
            unique: true,
            required: true,
        },

        customerName: {
            type: String,
            required: true,
        },

        customerPhone: {
            type: Number,
            required: true,
        },

        type: {
            type: String,
            enum: ["Return", "Exchange"],
            required: true,
        },

        returnedItems: {
            type: [itemSchema],
            default: [],
        },

        exchangedItems: {
            type: [itemSchema],
            default: [],
        },

        refund: {
            cash: {
                type: Number,
                default: 0,
            },

            upi: {
                type: Number,
                default: 0,
            },

            total: {
                type: Number,
                default: 0,
            },
        },

        additionalPayment: {
            cash: {
                type: Number,
                default: 0,
            },

            upi: {
                type: Number,
                default: 0,
            },

            total: {
                type: Number,
                default: 0,
            },
        },

        reason: {
            type: String,
            default: "",
        },

        handledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "ReturnExchange",
    returnExchangeSchema
);