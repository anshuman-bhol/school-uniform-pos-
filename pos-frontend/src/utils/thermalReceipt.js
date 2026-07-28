const RECEIPT_WIDTH = 48;
const LINE = "-".repeat(RECEIPT_WIDTH);

const center = (text, width = RECEIPT_WIDTH) => {
    text = String(text);
    if (text.length >= width) return text;
    const left = Math.floor((width - text.length) / 2);
    return " ".repeat(left) + text;
};

const row = (left, right, width = RECEIPT_WIDTH) => {
    left = String(left);
    right = String(right);
    const spaces = width - left.length - right.length;
    return left + " ".repeat(Math.max(1, spaces)) + right;
};

const itemRow = (name, qty, rate, total) => {

    const item =
        String(name).length > 22
            ? String(name).substring(0, 22)
            : String(name).padEnd(22);

    const qtyText = String(qty).padStart(4);

    const rateText =
        typeof rate === "number"
            ? rate.toFixed(2).padStart(10)
            : String(rate).padStart(10);

    const totalText =
        typeof total === "number"
            ? total.toFixed(2).padStart(12)
            : String(total).padStart(12);

    return `${item}${qtyText}${rateText}${totalText}`;
};

export const thermalReceipt = (order) => {

    const receipt = [];
    const bills = order.bills || {};
    const paymentdata = order.paymentData || {};
    const subtotal = Number(bills.total || 0);
    //const tax = Number(bills.tax || 0);
    const discount = Number(bills.discount?.amount || 0);
    const advancePaid = Number(paymentdata.advancePaid || 0);
    const remainingAmount = Number(paymentdata.remainingAmount || 0);
    const finalAmount = Number(bills.finalAmount || 0);

    receipt.push(center("PUSTAK MANDIR (P) LTD"));
    receipt.push(center("Ready for school · Ready for success"));
    receipt.push(center("Shop No-3 & 4, Sector-18, Market Building"));
    receipt.push(center("Rourkela, Odisha"));
    receipt.push(center("+91 76099 96355"));

    receipt.push("");
    receipt.push(LINE);

    receipt.push(`Invoice : ${order.invoiceNumber}`);
    receipt.push(`Date    : ${new Date(order.orderDate).toLocaleDateString()}`);
    receipt.push(`Time    : ${new Date(order.orderDate).toLocaleTimeString()}`);

    receipt.push(LINE);

    receipt.push(`Customer : ${order.customerDetails.name}`);
    receipt.push(`Phone    : ${order.customerDetails.phone}`);
    receipt.push(
        `Delivery : ${order.customerDetails.deliveryDate
            ? new Date(order.customerDetails.deliveryDate).toLocaleDateString()
            : "-"
        }`
    );

    if (order.orderStatus?.readyMade) {
        receipt.push(`ReadyMade: ${order.orderStatus.readyMade.status}`);
    }

    if (order.orderStatus?.tailoring) {
        receipt.push(`Tailoring: ${order.orderStatus.tailoring.status}`);
    }
    receipt.push(`Payment  : ${order.paymentMethod}`);

    if (order.tailor?.name) {
        receipt.push(`Tailor   : ${order.tailor.name}`);
    }

    receipt.push(LINE);
    receipt.push(itemRow("Item", "Qty", "Rate", "Amount"));
    receipt.push(LINE);

    order.items.forEach((item) => {

        const qty = Number(item.quantity) || 1;
        const total = Number(item.price) || 0;
        const rate = total / qty;
        const colour = item.colour || item.color || "-";
        const name = String(item.name || "");
        // Width available for product name after Qty/Rate/Amount columns
        const NAME_WIDTH = 22;
        if (name.length <= NAME_WIDTH) {
            receipt.push(
                itemRow(name, qty, rate, total)
            );
        } else {
            // First line with values
            receipt.push(itemRow(name.substring(0, NAME_WIDTH), qty, rate, total));
            // Remaining name on next lines
            for (let i = NAME_WIDTH; i < name.length; i += RECEIPT_WIDTH) {
                receipt.push(name.substring(i, i + RECEIPT_WIDTH));
            }
        }
        if (item.size) {
            receipt.push(`Size   : ${item.size}`);
        }
        receipt.push(`School   : ${item.school}`);
        receipt.push(`Colour : ${colour}`);

        // Blank line between items
        receipt.push("");
    });
    receipt.push(LINE);
    receipt.push(row("Subtotal", subtotal.toFixed(2)));

    //receipt.push(row("GST", tax.toFixed(2)));

    if (order.bills.discount?.amount > 0) {
        receipt.push(
            row(
                "Discount",
                `- ${discount.toFixed(2)}`
            )
        );
    }

    receipt.push(row("Advance", advancePaid.toFixed(2)));
    receipt.push(row("Balance", remainingAmount.toFixed(2)));
    receipt.push(LINE);
    receipt.push(row("TOTAL", `Rs. ${finalAmount.toFixed(2)}`));
    receipt.push(LINE);
    receipt.push("");

    if (remainingAmount <= 0) {
        receipt.push(center("PAYMENT COMPLETE"));
    } else {
        receipt.push(center("ADVANCE RECEIVED"));
    }

    receipt.push("");
    receipt.push(center("Thank You"));
    receipt.push(center("Visit Again"));
    receipt.push("");
    return receipt.join("\n") + "\n\n\n\x1D\x56\x00";
};