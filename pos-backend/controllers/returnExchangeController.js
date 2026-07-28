const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ReturnExchange = require("../models/returnExchangeModel");
const updateStock = require("../utils/updateStock");

const createReturn = async (req, res, next) => {

    const lastReturn = await ReturnExchange.findOne()
        .sort({ createdAt: -1 });

    let returnNumber = "RET000001";

    if (lastReturn?.returnNumber) {

        const lastNumber = parseInt(
            lastReturn.returnNumber.replace("RET", ""),
            10
        );

        returnNumber =
            `RET${String(lastNumber + 1).padStart(6, "0")}`;

    }

    try {
        const {
            orderId,
            returnedItems,
            refund,
            reason,
        } = req.body;
        const order = await Order.findById(orderId);
        let calculatedRefund = 0;
        if (!order) {
            return next(
                createHttpError(
                    404,
                    "Order not found"
                )
            );
        }
        for (const returnItem of returnedItems) {
            const orderItem =
                order.items.find(
                    item =>
                        item.itemId.toString() ===
                        returnItem.itemId &&
                        item.size === returnItem.size &&
                        item.colour === returnItem.colour
                );
            if (!orderItem) {
                return next(
                    createHttpError(
                        400,
                        `${returnItem.name} not found in order`
                    )
                );
            }
            const availableReturn = orderItem.quantity
            if (
                returnItem.quantity >
                availableReturn
            ) {

                return next(
                    createHttpError(
                        400,
                        `Cannot return more than purchased quantity for ${returnItem.name}`
                    )
                );
            }
            calculatedRefund +=
                orderItem.pricePerQuantity * returnItem.quantity;
            orderItem.returnedQuantity += returnItem.quantity;
            // Reduce quantity in the order
            orderItem.quantity -= returnItem.quantity;

            // Recalculate item amount
            orderItem.price = orderItem.quantity * orderItem.pricePerQuantity;
        }

        if (
            refund.total !== calculatedRefund
        ) {

            return next(
                createHttpError(
                    400,
                    "Refund amount is invalid."
                )
            );

        }

        /*
            Restore stock
        */
        for (const item of returnedItems) {

            await updateStock({

                itemId: item.itemId,

                size: item.size,

                colour: item.colour,

                quantity: item.quantity,

                operation: "return",

                remarks: `Return against Invoice ${order.invoiceNumber}`,

            });

        }
        /*
            Add negative cash ledger entry
        */
        order.paymentHistory.push({
            cashAmount:
                -refund.cash || 0,
            upiAmount:
                -refund.upi || 0,
            totalAmount:
                -refund.total || 0,
            receivedBy:
                req.user?._id,
        });
        if (refund.cash + refund.upi !== refund.total) {
            return next(
                createHttpError(
                    400,
                    "Invalid refund amount."
                )
            );
        }

        // Refund cannot exceed amount already paid
        if (refund.total > order.paymentData.advancePaid) {
            return next(
                createHttpError(
                    400,
                    "Refund cannot exceed the amount paid by the customer."
                )
            );
        }

        // Remove items with zero quantity (optional)
        order.items = order.items.filter(item => item.quantity > 0);

        // Recalculate subtotal
        const subtotal = order.items.reduce((sum, item) => {
            item.price = item.pricePerQuantity * item.quantity;
            return sum + item.price;
        }, 0);

        order.bills.total = subtotal;

        // GST
        order.bills.tax = +(subtotal * 0.00).toFixed(2); // use your GST if applicable

        order.bills.totalWithTax =
            +(order.bills.total + order.bills.tax).toFixed(2);

        // Discount
        let discountAmount = 0;

        if (order.bills.discount?.type === "percentage") {

            discountAmount =
                +(order.bills.totalWithTax *
                    order.bills.discount.value /
                    100).toFixed(2);

            order.bills.discount.amount = discountAmount;

        } else {

            discountAmount =
                order.bills.discount?.amount || 0;

        }

        order.bills.finalAmount =
            Math.max(
                0,
                +(order.bills.totalWithTax - discountAmount).toFixed(2)
            );

        // Reduce amount paid
        order.paymentData.advancePaid -= refund.total;

        // Recalculate remaining amount
        order.paymentData.remainingAmount =
            order.bills.finalAmount -
            order.paymentData.advancePaid;

        // Update payment status
        order.paymentStatus =
            order.paymentData.remainingAmount === 0
                ? "Paid"
                : "Pending";

        order.markModified("items");
        order.markModified("bills");
        order.markModified("paymentData");

        console.log(
            order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                returnedQuantity: item.returnedQuantity,
            }))
        );

        await order.save();

        const savedOrder = await Order.findById(order._id);

        const returnRecord =
            await ReturnExchange.create({

                order: order._id,

                invoiceNumber: order.invoiceNumber,

                returnNumber,

                customerName: order.customerDetails.name,

                customerPhone: order.customerDetails.phone,

                type: "Return",

                returnedItems,

                refund,

                reason,

                handledBy: req.user?._id,

            });
        res.status(201).json({
            success: true,
            message:
                "Return processed successfully",
            data:
                returnRecord,
        });
    }
    catch (error) {

        next(error);
    }
};

const createExchange = async (req, res, next) => {
    try {

        // --------------------------------------------------
        // Generate Exchange Number
        // --------------------------------------------------

        const lastExchange = await ReturnExchange.findOne({
            type: "Exchange",
        }).sort({ createdAt: -1 });

        let exchangeNumber = "EXC000001";

        if (lastExchange?.returnNumber) {
            const lastNumber = parseInt(
                lastExchange.returnNumber.replace("EXC", ""),
                10
            );

            exchangeNumber = `EXC${String(lastNumber + 1).padStart(6, "0")}`;
        }

        const {
            orderId,
            returnedItem,
            exchangedItem,
            refund,
            additionalPayment,
            reason,
        } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return next(createHttpError(404, "Order not found."));
        }

        // --------------------------------------------------
        // Find Old Item
        // --------------------------------------------------

        const orderItem = order.items.id(returnedItem.orderItemId);

        if (!orderItem) {
            return next(
                createHttpError(
                    400,
                    "Selected item not found in order."
                )
            );
        }

        const availableQty = orderItem.quantity;

        if (returnedItem.quantity > availableQty) {
            return next(
                createHttpError(
                    400,
                    "Invalid exchange quantity."
                )
            );
        }

        if (
            returnedItem.quantity !==
            exchangedItem.quantity
        ) {
            return next(
                createHttpError(
                    400,
                    "Exchange quantity mismatch."
                )
            );
        }

        // --------------------------------------------------
        // Find New Product
        // --------------------------------------------------
        const categories = await Product.find();

        if (!categories.length) {
            return next(
                createHttpError(
                    404,
                    "Product not found."
                )
            );
        }

        const newProduct = categories
            .flatMap(category => category.items)
            .find(
                item =>
                    item.name === orderItem.name &&
                    item.school === exchangedItem.school
            );

        if (!newProduct) {
            return next(
                createHttpError(
                    404,
                    "Requested school not available."
                )
            );
        }

        const variant = newProduct.variants.find(
            v =>
                v.size === exchangedItem.size &&
                (v.color || "").trim().toLowerCase() ===
                (orderItem.colour || "").trim().toLowerCase()
        );

        if (!variant) {
            return next(
                createHttpError(
                    404,
                    "Requested size not available."
                )
            );
        }

        if (variant.stock < exchangedItem.quantity) {
            return next(
                createHttpError(
                    400,
                    "Insufficient stock."
                )
            );
        }

        // --------------------------------------------------
        // Calculate Difference
        // --------------------------------------------------

        const oldAmount =
            orderItem.pricePerQuantity *
            returnedItem.quantity;

        const newAmount =
            newProduct.sellingPrice *
            exchangedItem.quantity;

        const difference = newAmount - oldAmount;

        // --------------------------------------------------
        // Validate Money
        // --------------------------------------------------

        if (difference > 0) {

            if (
                additionalPayment.total !== difference
            ) {
                return next(
                    createHttpError(
                        400,
                        "Additional payment mismatch."
                    )
                );
            }

            if (
                additionalPayment.cash +
                additionalPayment.upi !==
                difference
            ) {
                return next(
                    createHttpError(
                        400,
                        "Invalid payment split."
                    )
                );
            }
        }

        if (difference < 0) {

            const refundAmount = Math.abs(difference);

            if (refund.total !== refundAmount) {
                return next(
                    createHttpError(
                        400,
                        "Refund amount mismatch."
                    )
                );
            }

            if (
                refund.cash +
                refund.upi !==
                refundAmount
            ) {
                return next(
                    createHttpError(
                        400,
                        "Invalid refund split."
                    )
                );
            }
        }

        // --------------------------------------------------
        // Restore Old Stock
        // --------------------------------------------------

        await updateStock({
            itemId: orderItem.itemId,
            size: orderItem.size,
            colour: orderItem.colour,
            quantity: returnedItem.quantity,
            operation: "return",
            remarks: `Exchange Invoice ${order.invoiceNumber}`,
        });

        // --------------------------------------------------
        // Deduct New Stock
        // --------------------------------------------------

        await updateStock({
            itemId: newProduct._id,
            size: exchangedItem.size,
            colour: orderItem.colour,
            quantity: exchangedItem.quantity,
            operation: "sale",
            remarks: `Exchange Invoice ${order.invoiceNumber}`,
        });

        // --------------------------------------------------
        // Update Order Item
        // --------------------------------------------------

        // Quantity being exchanged
        if (returnedItem.quantity !== exchangedItem.quantity) {
            return next(
                createHttpError(
                    400,
                    "Returned and exchanged quantity must be the same."
                )
            );
        }

        const exchangeQty = returnedItem.quantity;

        // Remaining quantity after exchange
        const remainingQty =
            orderItem.quantity - exchangeQty;

        // ----------------------------------------
        // Partial Exchange
        // ----------------------------------------

        if (remainingQty > 0) {

            // Original item keeps remaining quantity
            orderItem.quantity = remainingQty;

            orderItem.price =
                remainingQty *
                orderItem.pricePerQuantity;

            // New exchanged item
            const existing = order.items.find(
                item =>
                    item.itemId.toString() === newProduct._id.toString() &&
                    item.school === newProduct.school &&
                    item.size === exchangedItem.size &&
                    item.colour === orderItem.colour
            );
            if (existing) {

                existing.quantity += exchangeQty;
                existing.price =
                    existing.quantity *
                    existing.pricePerQuantity;

            } else {

                order.items.push({
                    itemId: newProduct._id,
                    name: newProduct.name,
                    itemType: "ReadyMade",
                    school: newProduct.school,
                    size: exchangedItem.size,
                    colour: orderItem.colour,
                    quantity: exchangeQty,
                    returnedQuantity: 0,
                    pricePerQuantity: newProduct.sellingPrice,
                    price: newProduct.sellingPrice * exchangeQty,
                });

            }
        }

        // ----------------------------------------
        // Full Exchange
        // ----------------------------------------

        else {

            orderItem.itemId = newProduct._id;

            orderItem.school = newProduct.school;

            orderItem.size = exchangedItem.size;

            orderItem.pricePerQuantity =
                newProduct.sellingPrice;

            orderItem.price =
                newProduct.sellingPrice *
                exchangeQty;

        }

        // --------------------------------------------------
        // Recalculate Complete Bill
        // --------------------------------------------------

        const subtotal = order.items.reduce((sum, item) => {

            item.price =
                item.pricePerQuantity * item.quantity;

            return sum + item.price;

        }, 0);

        order.bills.total = subtotal;

        order.bills.tax = +(subtotal * 0.0).toFixed(2);

        order.bills.totalWithTax =
            +(subtotal + order.bills.tax).toFixed(2);

        // -------------------------------
        // Discount
        // -------------------------------

        let discountAmount = 0;

        if (order.bills.discount?.type === "percentage") {

            discountAmount =
                +(order.bills.totalWithTax *
                    order.bills.discount.value / 100).toFixed(2);

            order.bills.discount.amount =
                discountAmount;

        }
        else {

            discountAmount =
                order.bills.discount?.amount || 0;

        }

        order.bills.finalAmount =
            Math.max(
                0,
                +(order.bills.totalWithTax - discountAmount).toFixed(2)
            );

        // --------------------------------------------------
        // Payment History
        // --------------------------------------------------

        if (difference > 0) {

            order.paymentHistory.push({
                cashAmount:
                    additionalPayment.cash,
                upiAmount:
                    additionalPayment.upi,
                totalAmount:
                    additionalPayment.total,
                receivedBy:
                    req.user._id,
            });

            order.paymentData.advancePaid +=
                additionalPayment.total;
        }

        if (difference < 0) {

            order.paymentHistory.push({
                cashAmount:
                    -refund.cash,
                upiAmount:
                    -refund.upi,
                totalAmount:
                    -refund.total,
                receivedBy:
                    req.user._id,
            });

            order.paymentData.advancePaid =
                Math.max(
                    0,
                    order.paymentData.advancePaid -
                    refund.total
                );
        }

        order.paymentData.remainingAmount =
            Math.max(
                0,
                +(order.bills.finalAmount -
                    order.paymentData.advancePaid).toFixed(2)
            );

        order.paymentStatus =
            order.paymentData.remainingAmount <= 0
                ? "Paid"
                : "Pending";

        order.markModified("items");
        order.markModified("bills");
        order.markModified("paymentData");

        await order.save();

        // --------------------------------------------------
        // Save Exchange Record
        // --------------------------------------------------

        const exchangeRecord =
            await ReturnExchange.create({

                order: order._id,

                invoiceNumber:
                    order.invoiceNumber,

                returnNumber:
                    exchangeNumber,

                customerName:
                    order.customerDetails.name,

                customerPhone:
                    order.customerDetails.phone,

                type: "Exchange",

                returnedItems: [
                    {
                        itemId: orderItem.itemId,
                        name: orderItem.name,
                        itemType: orderItem.itemType,
                        school: orderItem.school,
                        size: orderItem.size,
                        colour: orderItem.colour,
                        quantity: exchangeQty,
                        pricePerQuantity: orderItem.pricePerQuantity,
                        amount: orderItem.pricePerQuantity * exchangeQty,
                    }
                ],

                exchangedItems: [
                    {
                        itemId: newProduct._id,
                        name: newProduct.name,
                        itemType: "ReadyMade",
                        school: newProduct.school,
                        size: exchangedItem.size,
                        colour: orderItem.colour,
                        quantity: exchangeQty,
                        pricePerQuantity: newProduct.sellingPrice,
                        amount:
                            newProduct.sellingPrice *
                            exchangeQty,
                    }
                ],

                refund,

                additionalPayment,

                reason,

                handledBy:
                    req.user._id,

            });

        res.status(201).json({
            success: true,
            message:
                "Exchange completed successfully.",
            data: exchangeRecord,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReturn,
    createExchange,
};