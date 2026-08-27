const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
    {
        size: {
            type: String,
            required: true,
        },

        color: {
            type: String,
            default: "",
        },

        stock: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        itemType: {
            type: String,
            enum: ["ReadyMade", "Tailoring"],
            default: "ReadyMade",
            required: true,
        },

        sellingPrice: {
            type: Number,
            required: true,
        },

        school: {
            type: String,
            default: "",
        },

        gender: {
            type: String,
            enum: ["Boys", "Girls", "Unisex", "UNISEX"],
            default: "Unisex",
        },

        variants: [variantSchema],

        active: {
            type: Boolean,
            default: true,
        },
    },
    { _id: true }
);

const productSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
        },

        items: [itemSchema],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);