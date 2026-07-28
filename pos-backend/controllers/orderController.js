const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const Product = require("../models/productModel");
const StockHistory = require("../models/stockHistoryModel");
const Order = require("../models/orderModel");
const Tailor = require("../models/tailorModel");
const deductStock = require("../utils/deductStock");
const updateStockAfterBillModification = require("../utils/updateStockAfterBillModification");

const refreshTailorStatus = async (tailorId) => {
    if (!tailorId) return;

    const tailor = await Tailor.findById(tailorId);

    if (!tailor) return;
    if (tailor.status === "Inactive") {
        return;
    }


    tailor.status =
        tailor.currentOrders.length > 0
            ? "Busy"
            : "Available";

    await tailor.save();
};

// ==========================
// Add Order
// ==========================
const addOrder = async (req, res, next) => {
    try {
        if (!req.body.bills.finalAmount) {
            req.body.bills.finalAmount =
                req.body.bills.totalWithTax;
        }
        if (!req.body.bills.discount) {
            req.body.bills.discount = {
                type: "amount",
                value: 0,
                amount: 0,
            };
        }

        const hasReadyMade = req.body.items.some(
            item => item.itemType === "ReadyMade"
        );

        const hasTailoring = req.body.items.some(
            item => item.itemType === "Tailoring"
        );

        req.body.orderStatus = {

            readyMade: hasReadyMade
                ? {
                    status: "Delivered",
                }
                : null,

            tailoring: hasTailoring
                ? {
                    status: req.body.tailor
                        ? "Tailor Assigned"
                        : "Order Placed",
                }
                : null,

        };
        // -------------------------
        // Create Order
        // -------------------------

        const order = new Order(req.body);
        if (hasReadyMade) {
            order.completedAt = new Date();
        }
        // -------------------------
        // Assign Tailor
        // -------------------------

        if (req.body.tailor) {
            const tailor = await Tailor.findById(req.body.tailor);
            if (!tailor) {
                return next(
                    createHttpError(404, "Tailor not found")
                );
            }
            order.tailor = tailor._id;

        }
        const initialPayment =
            Number(order.paymentData.cashAmount) +
            Number(order.paymentData.upiAmount);

        if (initialPayment > 0) {
            order.paymentHistory.push({
                cashAmount: order.paymentData.cashAmount,
                upiAmount: order.paymentData.upiAmount,
                totalAmount: initialPayment,
                receivedBy: req.user._id,
                date: new Date(),
            });
        }

        await order.save();
        if (hasReadyMade) {
            await deductStock(order);
        }

        // -------------------------
        // Update Tailor
        // -------------------------

        if (order.tailor) {
            const tailor = await Tailor.findById(order.tailor);

            if (!tailor.currentOrders.includes(order._id)) {
                tailor.currentOrders.push(order._id);
            }

            await tailor.save();
            await refreshTailorStatus(tailor._id);
        }

        // -------------------------
        // Deduct Inventory ONLY for Ready-made Orders
        // -------------------------
        const populatedOrder = await Order.findById(order._id).populate("tailor");
        res.status(201).json({
            success: true,
            message: "Order created successfully!",
            data: populatedOrder,
        });

    } catch (error) {
        next(error);
    }
};

// ==========================
// Get Order By Id
// ==========================

const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(404, "Invalid id!"));
        }
        const order = await Order.findById(id).populate("tailor");
        if (!order) {
            return next(createHttpError(404, "Order not found!"));
        }
        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================
// Get All Orders
// ==========================

const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate("tailor");
        res.status(200).json({
            success: true,
            data: orders,
        });

    } catch (error) {
        next(error);
    }
};

const getPaymentLedger = async (req, res, next) => {
    try {

        const orders = await Order.find()
            .populate("paymentHistory.receivedBy", "name");

        const ledgerMap = {};

        orders.forEach((order) => {

            order.paymentHistory.forEach((payment) => {

                const date = payment.date
                    .toISOString()
                    .split("T")[0];

                if (!ledgerMap[date]) {

                    ledgerMap[date] = {
                        date,
                        total: 0,
                        cash: 0,
                        upi: 0,
                        transactions: [],
                    };

                }

                ledgerMap[date].cash += payment.cashAmount;
                ledgerMap[date].upi += payment.upiAmount;
                ledgerMap[date].total += payment.totalAmount;

                ledgerMap[date].transactions.push({
                    orderId: order._id,
                    customer: order.customerDetails.name,
                    cash: payment.cashAmount,
                    upi: payment.upiAmount,
                    total: payment.totalAmount,
                    receivedBy:
                        payment.receivedBy?.name || "-",
                    time: payment.date,
                });

            });

        });

        const ledger = Object.values(ledgerMap).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        res.status(200).json({
            success: true,
            data: ledger,
        });

    } catch (error) {
        next(error);
    }
};

// ==========================
// Update Order
// ==========================

const updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(404, "Invalid Order ID"));
        }
        const order = await Order.findById(id);
        if (!order) {
            return next(createHttpError(404, "Order not found"));
        }

        const hasReadyMade = order.items.some(item => item.itemType === "ReadyMade");
        const hasTailoring = order.items.some(item => item.itemType === "Tailoring");
        if (!order) { return next(createHttpError(404, "Order not found")); }

        // =====================================
        // Assign / Change Tailor
        // =====================================

        if (req.body.tailor) {

            // Remove from previous tailor
            if (
                order.tailor &&
                order.tailor.toString() !== req.body.tailor
            ) {
                await Tailor.findByIdAndUpdate(
                    order.tailor,
                    {
                        $pull: {
                            currentOrders: order._id,
                        },
                    }
                );

                await refreshTailorStatus(order.tailor);
            }

            const tailor = await Tailor.findById(req.body.tailor);

            if (!tailor) {
                return next(
                    createHttpError(404, "Tailor not found")
                );
            }

            if (tailor.status === "Inactive") {
                return next(
                    createHttpError(400, "Cannot assign an inactive tailor.")
                );
            }

            if (order.tailor && order.tailor.toString() === tailor._id.toString()) {
                return next(
                    createHttpError(400, "This tailor is already assigned.")
                );
            }

            order.tailor = tailor._id;

            if (!tailor.currentOrders.includes(order._id)) {
                tailor.currentOrders.push(order._id);
            }
            await tailor.save();
            await refreshTailorStatus(tailor._id);

            // Returning a delivered tailoring order back into production
            order.completedAt = null;
            order.orderStatus.tailoring.status =
                req.body.tailoringStatus || "Tailor Assigned";
        }

        // =====================================
        // Update Payment
        // =====================================

        if (req.body.paymentMethod) {
            order.paymentMethod = req.body.paymentMethod;
        }

        if (req.body.paymentStatus) {
            order.paymentStatus = req.body.paymentStatus;
        }

        if (req.body.paymentData) {
            order.paymentData = req.body.paymentData;
        }

        // =====================================
        // Ready-made Status
        // =====================================

        if (req.body.readyMadeStatus && hasReadyMade) {

            const previousStatus = order.orderStatus.readyMade.status;
            order.orderStatus.readyMade.status = req.body.readyMadeStatus;

            if (
                previousStatus !== "Delivered" &&
                req.body.readyMadeStatus === "Delivered"
            ) {
                await deductStock(order);
            }
        }

        // =====================================
        // Tailoring Status
        // =====================================

        if (req.body.tailoringStatus && hasTailoring) {

            const previousStatus = order.orderStatus.tailoring.status;

            // Delivery only after payment
            if (
                req.body.tailoringStatus === "Delivered" &&
                order.paymentStatus !== "Paid"
            ) {
                return next(
                    createHttpError(
                        400,
                        "Complete the remaining payment before delivery."
                    )
                );
            }

            order.orderStatus.tailoring.status = req.body.tailoringStatus;


            // =====================================
            // Delivered -> Previous Status
            // =====================================

            if (
                hasTailoring &&
                previousStatus === "Delivered" &&
                req.body.tailoringStatus !== "Delivered"
            ) {
                // Remove previous tailor
                if (order.tailor) {
                    await Tailor.findByIdAndUpdate(
                        order.tailor,
                        {
                            $pull: {
                                currentOrders: order._id,
                            },
                        }
                    );

                    await refreshTailorStatus(order.tailor);
                }

                // Clear tailor from order
                order.tailor = null;

                // Force workflow to restart
                order.orderStatus.tailoring.status = "Order Placed";
            }

            // =====================================
            // Delivered
            // =====================================

            // Assign completion time
            if (
                previousStatus !== "Delivered" &&
                req.body.tailoringStatus === "Delivered"
            ) {

                order.completedAt = new Date();

                if (order.tailor) {

                    await Tailor.findByIdAndUpdate(
                        order.tailor,
                        {
                            $pull: {
                                currentOrders: order._id,
                            },
                        }
                    );

                    await refreshTailorStatus(order.tailor);
                }
            }

            // Reopen tailoring order
            if (
                previousStatus === "Delivered" &&
                req.body.tailoringStatus !== "Delivered"
            ) {

                order.completedAt = null;
            }
        }

        await order.save();
        const updatedOrder = await Order.findById(order._id).populate("tailor");
        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: updatedOrder,
        });
    } catch (error) {
        next(error);
    }
};

const changeOrderTailor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tailorId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(404, "Invalid Order ID"));
        }
        const order = await Order.findById(id);
        if (!order) {
            return next(createHttpError(404, "Order not found"));
        }
        const tailor = await Tailor.findById(tailorId);
        if (!tailor) {
            return next(createHttpError(404, "Tailor not found"));
        }

        // Remove from previous tailor
        if (order.tailor) {
            await Tailor.findByIdAndUpdate(
                order.tailor,
                {
                    $pull: {
                        currentOrders: order._id,
                    },
                }
            );
            await refreshTailorStatus(order.tailor);
        }

        // Assign new tailor
        order.tailor = tailor._id;
        order.orderStatus.tailoring.status = "Tailor Assigned";
        await order.save();
        if (!tailor.currentOrders.includes(order._id)) {
            tailor.currentOrders.push(order._id);
        }
        await tailor.save();
        await refreshTailorStatus(tailor._id);
        const updatedOrder = await Order.findById(order._id).populate("tailor");

        res.status(200).json({
            success: true,
            message: "Tailor changed successfully.",
            data: updatedOrder,
        });

    } catch (error) {
        next(error);
    }
};

const updateOrderPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            cashAmount = 0,
            upiAmount = 0,
        } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(
                createHttpError(
                    404,
                    "Invalid Order ID."
                )
            );
        }
        const order = await Order.findById(id);
        const hasReadyMade = order.items.some(
            item => item.itemType === "ReadyMade"
        );

        const hasTailoring = order.items.some(
            item => item.itemType === "Tailoring"
        );
        if (!order) {
            return next(
                createHttpError(
                    404,
                    "Order not found."
                )
            );
        }
        const additionalPayment =
            Number(cashAmount) +
            Number(upiAmount);
        order.paymentData.cashAmount += Number(cashAmount);
        order.paymentData.upiAmount += Number(upiAmount);
        order.paymentData.advancePaid += additionalPayment;
        order.paymentHistory.push({
            cashAmount: Number(cashAmount),
            upiAmount: Number(upiAmount),
            totalAmount: additionalPayment,
            receivedBy: req.user._id,
            date: new Date(),
        });
        order.paymentData.remainingAmount = Math.max(
            order.paymentData.remainingAmount - additionalPayment,
            0
        );
        if (order.paymentData.remainingAmount === 0) {
            order.paymentStatus = "Paid";
        }
        await order.save();
        res.status(200).json({
            success: true,
            message: "Payment updated successfully.",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderBill = async (req, res, next) => {
    try {

        const { id } = req.params;
        const { items, bills } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return next(
                createHttpError(404, "Order not found")
            );
        }

        // -----------------------------
        // Update Stock
        // -----------------------------
        const oldItems = order.items.map(item => ({
            ...item.toObject(),
        }));

        await updateStockAfterBillModification(
            oldItems,
            items
        );

        // -----------------------------
        // Compare old & new bill
        // -----------------------------
        const oldFinalAmount = order.bills.finalAmount;
        const newFinalAmount = bills.finalAmount;

        const difference = newFinalAmount - oldFinalAmount;

        // -----------------------------
        // Bill Increased
        // -----------------------------
        if (difference > 0) {

            order.paymentData.remainingAmount += difference;

        }

        // -----------------------------
        // Bill Reduced (Refund)
        // -----------------------------
        else if (difference < 0) {

            const refundAmount = Math.abs(difference);

            // Refund is always from Cash Drawer
            order.paymentData.cashAmount -= refundAmount;

            // Customer has effectively paid less now
            order.paymentData.advancePaid -= refundAmount;

            // Record refund in payment history
            order.paymentHistory.push({
                cashAmount: -refundAmount,
                upiAmount: 0,
                totalAmount: -refundAmount,
                receivedBy: req.user._id,
                date: new Date(),
            });

        }

        // -----------------------------
        // Update Bill & Items
        // -----------------------------
        order.items = items;
        order.bills = bills;

        // -----------------------------
        // Recalculate Remaining Amount
        // -----------------------------
        order.paymentData.remainingAmount = Math.max(
            bills.finalAmount -
            order.paymentData.advancePaid,
            0
        );

        // -----------------------------
        // Payment Status
        // -----------------------------
        order.paymentStatus =
            order.paymentData.remainingAmount === 0
                ? "Paid"
                : "Pending";

        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate("tailor")
            .populate("paymentHistory.receivedBy", "name");

        res.status(200).json({
            success: true,
            message: "Bill updated successfully.",
            data: updatedOrder,
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    addOrder,
    getOrderById,
    getOrders,
    getPaymentLedger,
    updateOrder,
    updateOrderPayment,
    changeOrderTailor,
    updateOrderBill,
};