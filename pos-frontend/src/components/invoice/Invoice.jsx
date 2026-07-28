import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { printReceipt } from "../../utils/qzPrint";
import { thermalReceipt } from "../../utils/thermalReceipt";

const COLORS = {
  navy: [15, 23, 42],
  gold: [212, 175, 55],
  light: [248, 249, 250],
  border: [220, 220, 220],
  success: [34, 197, 94],
  darkText: [45, 45, 45],
  grayText: [120, 120, 120],
};

const Invoice = ({ orderInfo, onClose }) => {
  const invoiceRef = useRef(null);
  const [sending, setSending] = useState(false);
  const handlePrint = async () => {
    try {
      const receipt = thermalReceipt(orderInfo);

      console.log(receipt);
      console.log(orderInfo.orderStatus);
      await printReceipt(receipt);

    } catch (err) {
      console.error("PRINT ERROR:", err);
      alert(err.message);
    }
  };

  const drawRestaurantHeader = (pdf, pageWidth) => {
    // Header Background
    pdf.setFillColor(...COLORS.navy);
    pdf.rect(0, 0, pageWidth, 34, "F");

    // Bottom Gold Line
    pdf.setDrawColor(...COLORS.gold);
    pdf.setLineWidth(0.8);
    pdf.line(0, 34, pageWidth, 34);

    // Shop Name
    pdf.setTextColor(255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("PUSTAK MANDIR (P) LTD", 14, 15);

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.text("Ready for school · Ready for success", 14, 21);

    // Address & Contact
    drawRestaurantInfo(pdf);

    // Invoice Badge
    pdf.setFillColor(...COLORS.gold);
    pdf.roundedRect(pageWidth - 54, 8, 42, 15, 2, 2, "F");

    pdf.setTextColor(...COLORS.navy);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("INVOICE", pageWidth - 33, 18, {
      align: "center",
    });

    // Logo Circle
    pdf.setFillColor(255);
    pdf.circle(pageWidth - 20, 27, 5, "F");

    pdf.setTextColor(...COLORS.navy);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("PMPL", pageWidth - 20, 28.3, {
      align: "center",
    });

    pdf.setTextColor(0);
  };

  const drawRestaurantInfo = (pdf) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.grayText);

    pdf.text("Shop No-3 & 4, Sector-18 Market Building", 14, 27);
    pdf.text("Rourkela, Odisha - 769003", 14, 31);

    pdf.text("Phone : +91 76099 96355", 92, 27);
    pdf.text("GSTIN : 21AABCP0608F1Z6", 92, 31);

    pdf.setTextColor(0);
  };

  const drawInvoiceDetails = (pdf, orderInfo) => {
    pdf.setDrawColor(...COLORS.border);
    pdf.setFillColor(252, 252, 252);
    pdf.roundedRect(14, 45, 182, 30, 3, 3, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    pdf.text("Invoice No.", 18, 54);
    pdf.text("Generated", 18, 62);
    pdf.text("Delivery", 18, 70);

    pdf.setFont("helvetica", "normal");

    pdf.text(orderInfo.invoiceNumber || "-", 52, 54);

    const generated = new Date();

    pdf.text(
      generated.toLocaleDateString(),
      52,
      62
    );

    pdf.text(
      generated.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      115,
      62
    );

    if (orderInfo.customerDetails?.deliveryDate) {
      const delivery = new Date(orderInfo.customerDetails.deliveryDate);

      pdf.text(
        delivery.toLocaleDateString(),
        52,
        70
      );

      pdf.text(
        delivery.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        115,
        70
      );
    } else {
      pdf.text("-", 52, 70);
    }

    
  };

  const drawCustomerCard = (pdf, orderInfo) => {
    pdf.setFillColor(250, 250, 250);
    pdf.setDrawColor(...COLORS.border);
    pdf.roundedRect(14, 79, 88, 62, 3, 3, "FD");

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...COLORS.navy);
    pdf.text("CUSTOMER DETAILS", 18, 87);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.grayText);
    pdf.text("Customer Information", 18, 92);

    pdf.setTextColor(0);
    pdf.setFontSize(10);

    let y = 99;

    pdf.text(
      `Name : ${orderInfo.customerDetails?.name || "-"}`,
      18,
      y
    );

    y += 8;

    pdf.text(
      `Phone : ${orderInfo.customerDetails?.phone || "-"}`,
      18,
      y
    );

    y += 8;

    pdf.text(
      `Delivery : ${orderInfo.customerDetails?.deliveryDate
        ? new Date(
          orderInfo.customerDetails.deliveryDate
        ).toLocaleDateString()
        : "-"
      }`,
      18,
      y
    );

    if (orderInfo.customerDetails?.remarks) {
      y += 8;

      pdf.setFont("helvetica", "bold");
      pdf.text("Remarks :", 18, y);

      pdf.setFont("helvetica", "normal");

      pdf.text(
        orderInfo.customerDetails.remarks,
        38,
        y,
        {
          maxWidth: 58,
        }
      );
    }
  };

  const drawOrderCard = (pdf, orderInfo) => {
    pdf.setFillColor(250, 250, 250);
    pdf.setDrawColor(...COLORS.border);
    pdf.roundedRect(108, 79, 88, 62, 3, 3, "FD");

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...COLORS.navy);
    pdf.text("ORDER DETAILS", 112, 87);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.grayText);
    pdf.text("Order Information", 112, 92);

    pdf.setTextColor(0);

    // -------------------------
    // Status
    // -------------------------
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Status", 112, 100);

    const readyMadeStatus = orderInfo.orderStatus?.readyMade?.status;
    const tailoringStatus = orderInfo.orderStatus?.tailoring?.status;

    let displayStatus = "-";

    if (readyMadeStatus && tailoringStatus) {
      displayStatus = `${readyMadeStatus} / ${tailoringStatus}`;
    } else if (readyMadeStatus) {
      displayStatus = readyMadeStatus;
    } else if (tailoringStatus) {
      displayStatus = tailoringStatus;
    }

    const statusForColor = (
      tailoringStatus ||
      readyMadeStatus ||
      ""
    ).toLowerCase();

    // Badge Color
    if (statusForColor === "delivered") {
      pdf.setFillColor(34, 197, 94); // Green
    } else if (
      ["assigned", "stitching", "ready"].includes(statusForColor)
    ) {
      pdf.setFillColor(245, 158, 11); // Amber
    } else {
      pdf.setFillColor(239, 68, 68); // Red
    }

    // Wider badge
    pdf.roundedRect(130, 95, 58, 8, 3, 3, "F");

    pdf.setTextColor(255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);

    pdf.text(displayStatus, 159, 100, {
      align: "center",
    });

    pdf.setTextColor(0);

    // -------------------------
    // Payment Method
    // -------------------------
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Payment", 112, 111);

    pdf.setFillColor(...COLORS.navy);
    pdf.roundedRect(140, 106, 48, 8, 3, 3, "F");

    pdf.setTextColor(255);
    pdf.setFontSize(8);

    pdf.text(
      orderInfo.paymentMethod || "-",
      164,
      111,
      { align: "center" }
    );

    pdf.setTextColor(0);

    // -------------------------
    // Determine Order Type
    // -------------------------
    const hasReadyMade =
      orderInfo.items?.some(item => item.itemType === "ReadyMade");

    const hasTailoring =
      orderInfo.items?.some(item => item.itemType === "Tailoring");

    let orderType = "-";

    if (hasReadyMade && hasTailoring) {
      orderType = "Mixed";
    } else if (hasReadyMade) {
      orderType = "ReadyMade";
    } else if (hasTailoring) {
      orderType = "Tailoring";
    }

    // -------------------------
    // Tailor (Show only for tailoring)
    // -------------------------
    if (hasTailoring) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Tailor", 112, 122);

      pdf.setFont("helvetica", "normal");
      pdf.text(
        orderInfo.tailor?.name || "-",
        140,
        122
      );
    }

    // -------------------------
    // Order Type
    // -------------------------
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    const typeY = hasTailoring ? 132 : 122;

    pdf.text("Type", 112, typeY);

    pdf.setFont("helvetica", "normal");
    pdf.text(orderType, 140, typeY);
  };

  const drawItemsTable = (pdf, orderInfo) => {

    autoTable(pdf, {
      startY: 145,

      head: [[
        "#",
        "GARMENT",
        "SIZE",
        "COLOUR",
        "QTY",
        "RATE",
        "AMOUNT",
      ]],

      body: orderInfo.items.map((item, index) => {

        const qty = Number(item.quantity) || 1;
        const amount = Number(item.price) || 0;
        const rate = qty > 0 ? amount / qty : amount;

        return [
          index + 1,
          item.name + "\n" + item.school || "",
          item.size || "-",
          item.colour || item.color || "-",
          qty,
          `Rs. ${rate.toFixed(2)}`,
          `Rs. ${amount.toFixed(2)}`,
        ];
      }),

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 11,
        cellPadding: 3,
        minCellHeight: 12,
        valign: "middle",
        halign: "center",
        textColor: COLORS.darkText,
        lineColor: [225, 225, 225],
        lineWidth: 0.15,
        overflow: "linebreak",
      },

      bodyStyles: {
        minCellHeight: 15,
        cellPadding: 1
      },

      headStyles: {
        fillColor: COLORS.navy,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9.5,
        halign: "center",
      },

      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },

      columnStyles: {
        0: {
          cellWidth: 10,
          halign: "center",
        },

        1: {
          cellWidth: 60,
        },

        2: {
          cellWidth: 18,
          halign: "center",
        },

        3: {
          cellWidth: 25,
          halign: "center",
        },

        4: {
          cellWidth: 16,
          halign: "center",
        },

        5: {
          cellWidth: 28,
          halign: "right",
        },

        6: {
          cellWidth: 30,
          halign: "right",
          fontStyle: "bold",
        },
      },

      margin: {
        left: 14,
        right: 14,
      },
    });

    return pdf.lastAutoTable.finalY;
  };

  const drawBillSummary = (pdf, orderInfo, startY) => {
    const bills = orderInfo.bills || {};
    const paymentdata = orderInfo.paymentData || {};
    const subtotal = Number(bills.total || 0);
    //const tax = Number(bills.tax || 0);
    const discount = Number(bills.discount?.amount || 0);
    const advancePaid = Number(paymentdata.advancePaid || 0);
    const remainingAmount = Number(paymentdata.remainingAmount || 0);
    const grandTotal = Number(bills.finalAmount || 0);

    const boxX = 108;
    const boxY = startY;
    const boxWidth = 89;
    const boxHeight = 74;

    // Card
    pdf.setFillColor(250, 250, 250);
    pdf.setDrawColor(...COLORS.border);
    pdf.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, "FD");

    // Header
    pdf.setFillColor(...COLORS.gold);
    pdf.roundedRect(boxX + 2, boxY + 2, boxWidth - 4, 8, 2, 2, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...COLORS.navy);
    pdf.text("PAYMENT SUMMARY", boxX + boxWidth / 2, boxY + 8, {
      align: "center",
    });

    pdf.setTextColor(0);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const rows = [
      ["Subtotal", subtotal],
      //["GST (0.00%)", tax],
      ["Discount", -discount],
      ["Advance Paid", advancePaid],
      ["Balance Due", remainingAmount],
    ];

    let y = boxY + 18;

    rows.forEach(([label, value]) => {
      pdf.text(label, boxX + 6, y);

      const amount =
        value < 0
          ? `-Rs. ${Math.abs(value).toFixed(2)}`
          : `Rs. ${value.toFixed(2)}`;

      pdf.text(amount, boxX + boxWidth - 6, y, {
        align: "right",
      });

      y += 8;
    });

    // Divider
    pdf.setDrawColor(210);
    pdf.line(boxX + 6, y - 2, boxX + boxWidth - 6, y - 2);

    // Grand Total Box
    pdf.setFillColor(...COLORS.navy);
    pdf.roundedRect(
      boxX + 5,
      y + 3,
      boxWidth - 10,
      11,
      2,
      2,
      "F"
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(255);

    pdf.text("GRAND TOTAL", boxX + 9, y + 10);

    pdf.text(
      `Rs. ${grandTotal.toFixed(2)}`,
      boxX + boxWidth - 9,
      y + 10,
      {
        align: "right",
      }
    );

    pdf.setTextColor(0);

    return y + 20;
  };

  const drawFooter = (pdf, startY) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Footer needs about 52mm of space
    if (startY + 52 > pageHeight) {
      pdf.addPage();
      startY = 20;
    }

    // Divider
    pdf.setDrawColor(...COLORS.gold);
    pdf.setLineWidth(0.5);
    pdf.line(14, startY, pageWidth - 14, startY);

    // Thank You
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(...COLORS.navy);
    pdf.text("THANK YOU!", pageWidth / 2, startY + 10, {
      align: "center",
    });

    // Message
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.setTextColor(...COLORS.grayText);

    pdf.text(
      "Thank you for choosing PUSTAK MANDIR (P) LTD.",
      pageWidth / 2,
      startY + 18,
      { align: "center" }
    );

    pdf.text(
      "We appreciate your trust and look forward to serving you again.",
      pageWidth / 2,
      startY + 24,
      { align: "center" }
    );

    // Decorative Line
    pdf.setDrawColor(220);
    pdf.line(60, startY + 30, pageWidth - 60, startY + 30);

    // Footer Information
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    pdf.text(
      "PUSTAK MANDIR (P) LTD • Shop No-3 & 4, Sector-18 Market Building • Rourkela",
      pageWidth / 2,
      startY + 36,
      { align: "center" }
    );

    pdf.text(
      "Phone: +91 76099 96355 | GSTIN: 21AABCP0608F1Z6",
      pageWidth / 2,
      startY + 41,
      { align: "center" }
    );

    pdf.text(
      "This is a computer generated invoice. No signature required.",
      pageWidth / 2,
      startY + 46,
      { align: "center" }
    );

    pdf.setTextColor(0);

    return startY + 50;
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [360, 210],
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      drawRestaurantHeader(pdf, pageWidth);
      drawInvoiceDetails(pdf, orderInfo);
      drawCustomerCard(pdf, orderInfo);
      drawOrderCard(pdf, orderInfo);

      let tableEndY = drawItemsTable(pdf, orderInfo);

      if (tableEndY > pageHeight - 95) {
        pdf.addPage();
        tableEndY = 20;
      }

      const summaryEndY = drawBillSummary(
        pdf,
        orderInfo,
        tableEndY + 6
      );

      drawFooter(pdf, summaryEndY + 8);

      const customerName =
        orderInfo.customerDetails?.name
          ?.trim()
          ?.replace(/\s+/g, "_") || "Customer";

      pdf.save(
        `Invoice_${customerName}_${orderInfo.invoiceNumber}.pdf`
      );

    } catch (err) {
      console.error("PDF ERROR:", err);
      alert(err.message);
    }
  };

  const handleSendWhatsApp = async () => {
    if (sending) return;

    setSending(true);

    try {
      const orderId = orderInfo._id;

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/invoice/send-whatsapp`,
        {
          orderId,
        }
      );

      alert(response.data.message);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send invoice.";

      alert(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-black bg-opacity-50 flex justify-center items-center overflow-y-scroll scrollbar-none">
      <div className="bg-white p-4 rounded-lg shadow-lg w-100">
        {/* Receipt Content for Printing */}

        <div ref={invoiceRef} className="p-4">
          {/* Receipt Header */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
              className="w-12 h-12 border-8 border-green-500 rounded-full flex items-center justify-center shadow-lg bg-green-500"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-2xl"
              >
                <FaCheck className="text-white" />
              </motion.span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-center mb-2">Order Receipt</h2>
          <p className="text-gray-600 font-bold text-center">Thank you for your order!</p>

          {/* Order Details */}

          <div className="mt-4 border-t pt-4 text-lg font-medium text-black">
            <p><strong>Invoice No:</strong> {orderInfo.invoiceNumber}</p>
            <p><strong>Name:</strong> {orderInfo.customerDetails.name}</p>
            <p><strong>Phone:</strong> {orderInfo.customerDetails.phone}</p>
            <p><strong>Delivery Date:</strong> {new Date(orderInfo.customerDetails.deliveryDate).toLocaleDateString()}</p>
            <p><strong>Remarks:</strong> {orderInfo.customerDetails.remarks || "-"}</p>
          </div>

          {/* Items Summary */}

          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Items Ordered</h3>
            <ul className="text-sm text-gray-700">
              {orderInfo.items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border-b py-1 text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span className="font-semibold">
                    Rs. {item.price.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bills Summary */}

          <div className="mt-4 border-t pt-4 text-sm">
            <p>
              <strong>Subtotal:</strong>
              Rs. {orderInfo.bills.total.toFixed(2)}
            </p>

            <p>
              <strong>Tax:</strong>
              Rs. {orderInfo.bills.tax.toFixed(2)}
            </p>

            <p className="text-green-500">
              <strong>Discount:</strong>
              -Rs. {orderInfo.bills.discount.amount.toFixed(2)}
            </p>

            <p className="text-md font-semibold text-black">
              <strong>Grand Total:</strong>
              Rs. {orderInfo.bills.finalAmount.toFixed(2)}
            </p>
          </div>

          {/* Payment Details */}

          <div className="mb-2 mt-2 text-xs">
            {orderInfo.paymentMethod === "Cash" ? (
              <p><strong>Payment Method:</strong> {orderInfo.paymentMethod}</p>
            ) : (
              <>
                <p><strong>Payment Method:</strong> {orderInfo.paymentMethod}</p>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-4 gap-2 font-medium">
          <button onClick={handlePrint} className="text-blue-500 hover:underline text-xs px-4 py-2 rounded-lg">Print Receipt</button>
          <button onClick={handleDownloadPDF} className="text-green-500 hover:underline text-xs px-4 py-2 rounded-lg">Download PDF</button>
          <button
            onClick={handleSendWhatsApp}
            disabled={sending}
            className={`text-xs px-4 py-2 rounded-lg ${sending
              ? "text-gray-400 cursor-not-allowed"
              : "text-green-600 hover:underline"
              }`}
          >
            {sending ? "Sending..." : "Send WhatsApp"}
          </button>
          <button onClick={onClose} className="text-red-500 hover:underline text-xs px-4 py-2 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;