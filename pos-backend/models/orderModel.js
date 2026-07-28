const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
    customerDetails: {
        name: {
            type: String,
            required: true,
        },

        phone: {
            type: Number,
            required: true,
        },

        deliveryDate: {
            type: Date,
            required: true,
        },

        remarks: {
            type: String,
            default: "",
        },
    },
    orderStatus: {

        readyMade: {
            type: {
                status: {
                    type: String,
                    enum: ["Ready", "Delivered"],
                },
            },
            default: null,
        },

        tailoring: {
            type: {
                status: {
                    type: String,
                    enum: [
                        "Order Placed",
                        "Tailor Assigned",
                        "Stitching",
                        "Ready",
                        "Delivered",
                    ],
                },
            },
            default: null,
        },

    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null,
    },
    hasReadyMade: {
        type: Boolean,
        default: false,
    },
    hasTailoring: {
        type: Boolean,
        default: false,
    },
    bills: {
        total: {
            type: Number,
            required: true,
        },

        tax: {
            type: Number,
            required: true,
        },

        totalWithTax: {
            type: Number,
            required: true,
        },

        finalAmount: { type: Number, required: true, },

        discount: {
            type: { type: String, enum: ["amount", "percentage"], default: "amount", },
            value: { type: Number, default: 0, },
            amount: { type: Number, default: 0, },
        },

    },
    items: [
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

            pricePerQuantity: {
                type: Number,
                required: true,
            },

            quantity: {
                type: Number,
                required: true,
            },

            returnedQuantity: {
                type: Number,
                default: 0,
            },

            price: {
                type: Number,
                required: true,
            },
        },
    ],

    tailor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tailor",
        default: null,
    },

    paymentMethod: {
        type: String,
        enum: ["Cash", "UPI", "Cash + UPI"],
    },
    paymentData: {

        cashAmount: {
            type: Number,
            default: 0,
        },

        upiAmount: {
            type: Number,
            default: 0,
        },

        advancePaid: {
            type: Number,
            default: 0,
        },

        remainingAmount: {
            type: Number,
            default: 0,
        },
    },
    paymentHistory: [
        {
            date: {
                type: Date,
                default: Date.now,
            },

            cashAmount: {
                type: Number,
                default: 0,
            },

            upiAmount: {
                type: Number,
                default: 0,
            },

            totalAmount: {
                type: Number,
                default: 0,
            },
            receivedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        },
    ],
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending",
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema);