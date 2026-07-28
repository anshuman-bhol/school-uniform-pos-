const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const drawHeader = (doc) => {

    const pageWidth = doc.page.width;

    // Background
    doc
        .save()
        .rect(0, 0, pageWidth, 95)
        .fill("#0F172A")
        .restore();

    // Gold Divider
    doc
        .moveTo(0, 95)
        .lineTo(pageWidth, 95)
        .lineWidth(2)
        .stroke("#D4AF37");

    // Shop Name
    doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("PUSTAK MANDIR (P) LTD", 40, 22);

    doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text(
            "Ready for school · Ready for success",
            40,
            50
        );

    drawRestaurantInfo(doc);

    // Invoice Badge

    doc
        .roundedRect(
            pageWidth - 115,
            18,
            75,
            28,
            4
        )
        .fill("#D4AF37");

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(15)
        .text(
            "INVOICE",
            pageWidth - 115,
            28,
            {
                width: 75,
                align: "center",
            }
        );

    // Logo

    doc
        .circle(
            pageWidth - 28,
            72,
            20
        )
        .fill("white");

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
            "PMPL",
            pageWidth - 36,
            65,
            {
                width: 20,
                align: "center",
            }
        );
};

const drawRestaurantInfo = (doc) => {

    doc
        .fillColor("#787878")
        .font("Helvetica")
        .fontSize(8);

    doc.text(
        "Shop No-3 & 4, Sector-18 Market Building",
        40,
        70
    );

    doc.text(
        "Rourkela, Odisha - 769003",
        40,
        82
    );

    doc.text(
        "Phone : +91 76099 96355",
        285,
        70
    );

    doc.text(
        "GSTIN : 21AABCP0608F1Z6",
        285,
        82
    );

    doc.fillColor("black");
};

const drawInvoiceDetails = (doc, order) => {

    const x = 40;
    const y = 120;

    doc
        .roundedRect(
            x,
            y,
            515,
            70,
            4
        )
        .fillAndStroke(
            "#FCFCFC",
            "#DDDDDD"
        );

    doc
        .fillColor("black")
        .font("Helvetica-Bold")
        .fontSize(10);

    doc.text("Invoice No.", x + 15, y + 15);
    doc.text("Generated", x + 15, y + 31);
    doc.text("Delivery", x + 15, y + 47);

    doc
        .font("Helvetica")
        .fontSize(10);

    doc.text(
        order.invoiceNumber || "-",
        x + 105,
        y + 15
    );

    const generated = new Date();

    doc.text(
        generated.toLocaleDateString("en-IN"),
        x + 105,
        y + 31
    );

    doc.text(
        generated.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }),
        x + 175,
        y + 31
    );

    if (order.customerDetails?.deliveryDate) {

        const delivery = new Date(
            order.customerDetails.deliveryDate
        );

        doc.text(
            delivery.toLocaleDateString("en-IN"),
            x + 105,
            y + 47
        );

        doc.text(
            delivery.toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
            x + 175,
            y + 47
        );

    } else {

        doc.text(
            "-",
            x + 105,
            y + 47
        );
    }
};

const drawCustomerCard = (doc, order) => {

    const x = 40;
    const y = 210;

    doc
        .roundedRect(
            x,
            y,
            245,
            150,
            4
        )
        .fillAndStroke(
            "#FAFAFA",
            "#DDDDDD"
        );

    // Title

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(
            "CUSTOMER DETAILS",
            x + 15,
            y + 15
        );

    doc
        .fillColor("#787878")
        .font("Helvetica")
        .fontSize(9)
        .text(
            "Customer Information",
            x + 15,
            y + 35
        );

    doc
        .fillColor("black")
        .font("Helvetica")
        .fontSize(11);

    let lineY = y + 60;

    doc.text(
        `Name : ${order.customerDetails?.name || "-"}`,
        x + 15,
        lineY
    );

    lineY += 22;

    doc.text(
        `Phone : ${order.customerDetails?.phone || "-"}`,
        x + 15,
        lineY
    );

    lineY += 22;

    const delivery =
        order.customerDetails?.deliveryDate
            ? new Date(
                  order.customerDetails.deliveryDate
              ).toLocaleDateString("en-IN")
            : "-";

    doc.text(
        `Delivery : ${delivery}`,
        x + 15,
        lineY
    );

    if (order.customerDetails?.remarks) {

        lineY += 22;

        doc
            .font("Helvetica-Bold")
            .text(
                "Remarks :",
                x + 15,
                lineY
            );

        doc
            .font("Helvetica")
            .text(
                order.customerDetails.remarks,
                x + 75,
                lineY,
                {
                    width: 145
                }
            );
    }
};

const drawOrderCard = (doc, order) => {

    const x = 310;
    const y = 210;

    doc
        .roundedRect(
            x,
            y,
            245,
            150,
            4
        )
        .fillAndStroke(
            "#FAFAFA",
            "#DDDDDD"
        );

    // Title

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(
            "ORDER DETAILS",
            x + 15,
            y + 15
        );

    doc
        .fillColor("#787878")
        .font("Helvetica")
        .fontSize(9)
        .text(
            "Order Information",
            x + 15,
            y + 30
        );

    doc.fillColor("black");

    // ----------------------------
    // Status
    // ----------------------------

    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
            "Status",
            x + 15,
            y + 50
        );

    const readyMadeStatus =
        order.orderStatus?.readyMade?.status;

    const tailoringStatus =
        order.orderStatus?.tailoring?.status;

    let displayStatus = "-";

    if (readyMadeStatus && tailoringStatus) {

        displayStatus =
            `${readyMadeStatus} / ${tailoringStatus}`;

    }
    else if (readyMadeStatus) {

        displayStatus = readyMadeStatus;

    }
    else if (tailoringStatus) {

        displayStatus = tailoringStatus;

    }

    const status =
        (tailoringStatus ||
            readyMadeStatus ||
            "").toLowerCase();

    let badgeColor = "#EF4444";

    if (status === "delivered") {

        badgeColor = "#22C55E";

    }
    else if (
        ["assigned", "stitching", "ready"]
            .includes(status)
    ) {

        badgeColor = "#F59E0B";

    }

    doc
        .roundedRect(
            x + 95,
            y + 45,
            115,
            18,
            4
        )
        .fill(badgeColor);

    doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
            displayStatus,
            x + 95,
            y + 51,
            {
                width: 115,
                align: "center"
            }
        );

    doc.fillColor("black");

    // ----------------------------
    // Payment Method
    // ----------------------------

    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
            "Payment",
            x + 15,
            y + 76
        );

    doc
        .roundedRect(
            x + 105,
            y + 71,
            85,
            18,
            4
        )
        .fill("#0F172A");

    doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
            order.paymentMethod || "-",
            x + 105,
            y + 77,
            {
                width: 85,
                align: "center"
            }
        );

    doc.fillColor("black");

    // ----------------------------
    // Determine Order Type
    // ----------------------------

    const hasReadyMade =
        order.items.some(
            item => item.itemType === "ReadyMade"
        );

    const hasTailoring =
        order.items.some(
            item => item.itemType === "Tailoring"
        );

    let orderType = "-";

    if (hasReadyMade && hasTailoring)
        orderType = "Mixed";

    else if (hasReadyMade)
        orderType = "ReadyMade";

    else if (hasTailoring)
        orderType = "Tailoring";

    let currentY = y + 105;

    // ----------------------------
    // Tailor
    // ----------------------------

    if (hasTailoring) {

        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(
                "Tailor",
                x + 15,
                currentY
            );

        doc
            .font("Helvetica")
            .fontSize(10)
            .text(
                order.tailor?.name || "-",
                x + 105,
                currentY
            );

        currentY += 23;
    }

    // ----------------------------
    // Type
    // ----------------------------

    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
            "Type",
            x + 15,
            currentY
        );

    doc
        .font("Helvetica")
        .fontSize(10)
        .text(
            orderType,
            x + 105,
            currentY
        );
};

const drawItemsTable = (doc, order) => {

    const startX = 40;
    const tableWidth = 515;

    const col = {
        sno: 25,
        garment: 150,
        size: 55,
        colour: 75,
        qty: 40,
        rate: 80,
        amount: 90,
    };

    let y = 385;

    const drawHeader = () => {

        doc
            .rect(startX, y, tableWidth, 28)
            .fill("#0F172A");

        doc
            .fillColor("white")
            .font("Helvetica-Bold")
            .fontSize(10);

        let x = startX;

        doc.text("#", x, y + 9, {
            width: col.sno,
            align: "center",
        });

        x += col.sno;

        doc.text(
            "GARMENT",
            x,
            y + 9,
            {
                width: col.garment,
                align: "center",
            }
        );

        x += col.garment;

        doc.text(
            "SIZE",
            x,
            y + 9,
            {
                width: col.size,
                align: "center",
            }
        );

        x += col.size;

        doc.text(
            "COLOUR",
            x,
            y + 9,
            {
                width: col.colour,
                align: "center",
            }
        );

        x += col.colour;

        doc.text(
            "QTY",
            x,
            y + 9,
            {
                width: col.qty,
                align: "center",
            }
        );

        x += col.qty;

        doc.text(
            "RATE",
            x,
            y + 9,
            {
                width: col.rate,
                align: "center",
            }
        );

        x += col.rate;

        doc.text(
            "AMOUNT",
            x,
            y + 9,
            {
                width: col.amount,
                align: "center",
            }
        );

        y += 28;
    };

    drawHeader();

    order.items.forEach((item, index) => {

        const qty = Number(item.quantity) || 1;

        const amount =
            Number(item.price) || 0;

        const rate =
            qty > 0
                ? amount / qty
                : amount;

        const garment =
            item.name || "-";

        const school =
            item.school || "";

        //-----------------------------------
        // Same sizing behaviour as jsPDF
        //-----------------------------------

        doc.font("Helvetica-Bold").fontSize(11);

        const garmentHeight =
            doc.heightOfString(
                garment,
                {
                    width: col.garment - 8,
                }
            );

        doc.font("Helvetica").fontSize(9);

        const schoolHeight =
            doc.heightOfString(
                school,
                {
                    width: col.garment - 8,
                }
            );

        const rowHeight =
            Math.max(
                38,
                garmentHeight +
                schoolHeight +
                14
            );

        //-----------------------------------
        // Page Break
        //-----------------------------------

        if (
            y + rowHeight >
            doc.page.height - 190
        ) {

            doc.addPage();

            y = 40;

            drawHeader();
        }

        //-----------------------------------
        // Alternate Background
        //-----------------------------------

        if (index % 2 === 0) {

            doc
                .rect(
                    startX,
                    y,
                    tableWidth,
                    rowHeight
                )
                .fill("#F8F8F8");
        }

        doc
            .rect(
                startX,
                y,
                tableWidth,
                rowHeight
            )
            .stroke("#E1E1E1");

        //-----------------------------------
        // Vertical Alignment
        //-----------------------------------

        const centerY =
            y + rowHeight / 2 - 6;

        let x = startX;

        //-----------------------------------
        // S.No.
        //-----------------------------------

        doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(10)
            .text(
                String(index + 1),
                x,
                centerY,
                {
                    width: col.sno,
                    align: "center",
                }
            );

        x += col.sno;

        //-----------------------------------
        // Garment
        //-----------------------------------

        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("black")
            .text(
                garment,
                x + 3,
                y + 6,
                {
                    width: col.garment - 8,
                    align: "center",
                }
            );

        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#666666")
            .text(
                school,
                x + 3,
                y + garmentHeight + 9,
                {
                    width: col.garment - 8,
                    align: "center",
                }
            );

        x += col.garment;

        //-----------------------------------
        // Size
        //-----------------------------------

        doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(10)
            .text(
                item.size || "-",
                x,
                centerY,
                {
                    width: col.size,
                    align: "center",
                }
            );

        x += col.size;

        //-----------------------------------
        // Colour
        //-----------------------------------

        doc.text(
            item.colour ||
            item.color ||
            "-",
            x,
            centerY,
            {
                width: col.colour,
                align: "center",
            }
        );

        x += col.colour;

        //-----------------------------------
        // Qty
        //-----------------------------------

        doc.text(
            String(qty),
            x,
            centerY,
            {
                width: col.qty,
                align: "center",
            }
        );

        x += col.qty;

        //-----------------------------------
        // Rate
        //-----------------------------------

        doc.text(
            `Rs. ${rate.toFixed(2)}`,
            x,
            centerY,
            {
                width: col.rate,
                align: "center",
            }
        );

        x += col.rate;

        //-----------------------------------
        // Amount
        //-----------------------------------

        doc
            .font("Helvetica-Bold")
            .text(
                `Rs. ${amount.toFixed(2)}`,
                x,
                centerY,
                {
                    width: col.amount,
                    align: "center",
                }
            );

        y += rowHeight;
    });

    return y;
};

const drawPaymentSummary = (doc, order, startY) => {

    const bills = order.bills || {};
    const paymentData = order.paymentData || {};

    const subtotal = Number(bills.total || 0);
    const discount = Number(bills.discount?.amount || 0);
    const advancePaid = Number(paymentData.advancePaid || 0);
    const balanceDue = Number(paymentData.remainingAmount || 0);
    const grandTotal = Number(bills.finalAmount || 0);

    const boxX = 350;
    const boxY = startY + 10;
    const boxWidth = 205;
    const boxHeight = 160;

    // ----------------------------
    // Card
    // ----------------------------

    doc
        .roundedRect(boxX, boxY, boxWidth, boxHeight, 4)
        .fillAndStroke("#FAFAFA", "#DDDDDD");

    // ----------------------------
    // Gold Header
    // ----------------------------

    doc
        .roundedRect(
            boxX + 5,
            boxY + 5,
            boxWidth - 10,
            22,
            3
        )
        .fill("#D4AF37");

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(
            "PAYMENT SUMMARY",
            boxX,
            boxY + 12,
            {
                width: boxWidth,
                align: "center"
            }
        );

    // ----------------------------
    // Rows
    // ----------------------------

    doc
        .fillColor("black")
        .font("Helvetica")
        .fontSize(10);

    const rows = [
        ["Subtotal", subtotal],
        ["Discount", -discount],
        ["Advance Paid", advancePaid],
        ["Balance Due", balanceDue],
    ];

    let y = boxY + 42;

    rows.forEach(([label, value]) => {

        doc.text(label, boxX + 12, y);

        const amount =
            value < 0
                ? `-Rs. ${Math.abs(value).toFixed(2)}`
                : `Rs. ${value.toFixed(2)}`;

        doc.text(
            amount,
            boxX + boxWidth - 90,
            y,
            {
                width: 80,
                align: "right"
            }
        );

        y += 18;

    });

    // ----------------------------
    // Divider
    // ----------------------------

    doc
        .moveTo(boxX + 10, y - 5)
        .lineTo(boxX + boxWidth - 10, y - 5)
        .lineWidth(0.5)
        .strokeColor("#D2D2D2")
        .stroke();

    // ----------------------------
    // Grand Total
    // ----------------------------

    doc
        .roundedRect(
            boxX + 8,
            y + 8,
            boxWidth - 16,
            26,
            3
        )
        .fill("#0F172A");

    doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
            "GRAND TOTAL",
            boxX + 18,
            y + 17
        );

    doc.text(
        `Rs. ${grandTotal.toFixed(2)}`,
        boxX + boxWidth - 90,
        y + 17,
        {
            width: 70,
            align: "right"
        }
    );

    return boxY + boxHeight;
};

const drawFooter = (doc, startY) => {

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Footer needs about 110px
    if (startY + 110 > pageHeight - 20) {

        doc.addPage();

        startY = 40;
    }

    // Gold Divider
    doc
        .moveTo(40, startY)
        .lineTo(pageWidth - 40, startY)
        .lineWidth(0.8)
        .strokeColor("#D4AF37")
        .stroke();

    // THANK YOU
    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text(
            "THANK YOU!",
            0,
            startY + 12,
            {
                width: pageWidth,
                align: "center",
            }
        );

    // Message
    doc
        .fillColor("#787878")
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text(
            "Thank you for choosing PUSTAK MANDIR (P) LTD.",
            0,
            startY + 36,
            {
                width: pageWidth,
                align: "center",
            }
        );

    doc.text(
        "We appreciate your trust and look forward to serving you again.",
        0,
        startY + 50,
        {
            width: pageWidth,
            align: "center",
        }
    );

    // Decorative Divider
    doc
        .moveTo(180, startY + 70)
        .lineTo(pageWidth - 180, startY + 70)
        .strokeColor("#DDDDDD")
        .lineWidth(0.5)
        .stroke();

    // Footer Information
    doc
        .fillColor("#888888")
        .font("Helvetica")
        .fontSize(8);

    doc.text(
        "PUSTAK MANDIR (P) LTD • Shop No-3 & 4, Sector-18 Market Building • Rourkela",
        0,
        startY + 82,
        {
            width: pageWidth,
            align: "center",
        }
    );

    doc.text(
        "Phone : +91 76099 96355 | GSTIN : 21AABCP0608F1Z6",
        0,
        startY + 94,
        {
            width: pageWidth,
            align: "center",
        }
    );

    doc.text(
        "This is a computer generated invoice. No signature required.",
        0,
        startY + 106,
        {
            width: pageWidth,
            align: "center",
        }
    );

    return startY + 116;
};

const generateInvoicePDF = async (order) => {

    const invoicesDir = path.join(
        __dirname,
        "../uploads/invoices"
    );

    if (!fs.existsSync(invoicesDir)) {

        fs.mkdirSync(invoicesDir, {
            recursive: true,
        });

    }

    const customerName =
        (order.customerDetails?.name || "Customer")
            .trim()
            .replace(/\s+/g, "_");

    const fileName =
        `Invoice_${customerName}_${order.invoiceNumber}.pdf`;

    const filePath = path.join(
        invoicesDir,
        fileName
    );

    const doc = new PDFDocument({
        size: "A4",
        margin: 40,
    });

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ---------------------------------
    // Header
    // ---------------------------------

    drawHeader(doc);

    // ---------------------------------
    // Invoice Details
    // ---------------------------------

    drawInvoiceDetails(doc, order);

    // ---------------------------------
    // Customer Card
    // ---------------------------------

    drawCustomerCard(doc, order);

    // ---------------------------------
    // Order Card
    // ---------------------------------

    drawOrderCard(doc, order);

    // ---------------------------------
    // Items Table
    // ---------------------------------

    let tableEndY = drawItemsTable(doc, order);

    // Same logic as React Invoice.jsx
    if (tableEndY > doc.page.height - 220) {

        doc.addPage();

        tableEndY = 40;
    }

    // ---------------------------------
    // Payment Summary
    // ---------------------------------

    const summaryEndY = drawPaymentSummary(
        doc,
        order,
        tableEndY + 10
    );

    // ---------------------------------
    // Footer
    // ---------------------------------

    drawFooter(
        doc,
        summaryEndY + 10
    );

    doc.end();

    await new Promise((resolve, reject) => {

        stream.on("finish", resolve);

        stream.on("error", reject);

    });

    return filePath;
};

module.exports = {
    generateInvoicePDF
};