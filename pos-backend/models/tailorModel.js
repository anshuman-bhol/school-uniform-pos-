const mongoose = require("mongoose");

const tailorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            default: "",
        },

        specialization: {
            type: String,
            default: "General",
        },

        status: {
            type: String,
            enum: ["Available", "Busy", "Inactive"],
            default: "Available",
        },

        currentOrders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Tailor", tailorSchema);