import { useState } from "react";
import { calculateBill } from "../../utils/calculateBill";

const PaymentModal = ({
  cartItems,
  taxRate,
  requireFullPayment,
  onClose,
  onPaymentSuccess,
}) => {
  const [cashAmount, setCashAmount] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [discountType, setDiscountType] = useState("amount");
  const [discountValue, setDiscountValue] = useState("");
  const [editableCart, setEditableCart] = useState(cartItems.map(item => ({ ...item, })));
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const cash = Number(cashAmount) || 0;
  const upi = Number(upiAmount) || 0;
  const {
    subtotal,
    tax,
    totalWithTax,
    discountAmount,
    finalAmount,
  } = calculateBill(editableCart, {
    type: discountType,
    value: Number(discountValue) || 0,
  });

  const totalPaid = cash + upi;
  const remaining = Math.max(finalAmount - totalPaid, 0);
  const change = Math.max(totalPaid - finalAmount, 0);
  const paymentCompleted = requireFullPayment
    ? totalPaid >= finalAmount
    : totalPaid > 0;

  const hasUnsavedChanges =
  cash > 0 ||
  upi > 0 ||
  Number(discountValue) > 0 ||
  editableCart.some((item, index) => {
    const originalItem = cartItems[index];

    return (
      item.customPrice &&
      item.pricePerQuantity !== originalItem.pricePerQuantity
    );
  });

  const handleConfirmPayment = () => {
    if (requireFullPayment && totalPaid < finalAmount) {
      return;
    }
    onPaymentSuccess({
      updatedCart: editableCart,
      subtotal, tax, totalWithTax,
      cash, upi, advancePaid: totalPaid,
      remainingAmount: remaining,
      paymentMethod:
        cash > 0 && upi > 0
          ? "Cash + UPI"
          : cash > 0
            ? "Cash"
            : "UPI",
      paymentStatus:
        remaining === 0
          ? "Paid"
          : "Pending",
      discount: {
        type: discountType,
        value: Number(discountValue) || 0,
        amount: discountAmount,
      },
      finalAmount: finalAmount,

    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#2b2b2b] w-107.5 h-[80vh] rounded-xl p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-white text-center">Payment</h2>

        <div className="flex-1 overflow-y-auto scrollbar-none mt-5">
          {/* Discount */}
          <div className="mt-5">
            <label className="block mb-2 text-gray-300">Additional Discount</label>

            <div className="flex gap-3">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="bg-[#1f1f1f] text-white rounded-lg px-3 outline-none"
              >
                <option value="amount">₹</option>
                <option value="percentage">%</option>
              </select>

              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => {
                  const value = Math.max(0, Number(e.target.value));

                  if (discountType === "percentage") {
                    setDiscountValue(Math.min(value, 100));
                  } else {
                    setDiscountValue(Math.min(value, totalWithTax));
                  }
                }}
                placeholder={
                  discountType === "percentage"
                    ? "Enter %"
                    : "Enter Amount"
                }
                className="flex-1 bg-[#1f1f1f] text-white rounded-lg p-3 outline-none"
              />
            </div>
          </div>

          {/* Bill Items */}

          <div className="mt-6">
            <h3 className="text-lg text-white font-semibold mb-4">
              Bill Summary
            </h3>
            <div className="space-y-3">
              {editableCart.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#1f1f1f] rounded-lg p-3"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {item.name}-{item.school}
                      </p>
                      <p className="text-sm text-gray-400 font-semibold">
                        Qty : {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      {
                        item.customPrice ? (
                          <div className="flex flex-col items-end gap-2">
                            <input
                              type="number"
                              min="0"
                              value={item.pricePerQuantity || ""}
                              placeholder="Unit Price"

                              onChange={(e) => {

                                const value = Number(e.target.value) || 0;

                                setEditableCart(prev =>
                                  prev.map(cartItem => {

                                    if (cartItem.id !== item.id)
                                      return cartItem;

                                    return {
                                      ...cartItem,
                                      pricePerQuantity: value,
                                      price: value * cartItem.quantity,
                                    };

                                  })
                                );

                              }}

                              className="w-28 bg-[#2b2b2b] rounded px-2 py-1 text-right text-white outline-none"
                            />

                            <p className="text-xs text-gray-400 font-semibold">
                              ₹{item.pricePerQuantity || 0} x {item.quantity}
                            </p>

                            <p className="text-green-400 font-semibold">
                              ₹{item.price.toFixed(2)}
                            </p>

                          </div>

                        ) : (

                          <div className="text-right">

                            <p className="text-green-400 font-semibold">
                              ₹{item.price.toFixed(2)}
                            </p>

                            <p className="text-xs text-gray-400 font-semibold">
                              ₹{item.pricePerQuantity.toFixed(2)} × {item.quantity}
                            </p>

                          </div>

                        )
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash */}
          <div className="mt-6">
            <label className="block mb-2 text-gray-300">
              Cash Payment
            </label>

            <input
              type="number"
              min="0"
              placeholder="0"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              className="w-full bg-[#1f1f1f] text-white rounded-lg p-3 outline-none"
            />
          </div>

          {/* UPI */}
          <div className="mt-5">
            <label className="block mb-2 text-gray-300">
              UPI Payment
            </label>

            <input
              type="number"
              min="0"
              placeholder="0"
              value={upiAmount}
              onChange={(e) => setUpiAmount(e.target.value)}
              className="w-full bg-[#1f1f1f] text-white rounded-lg p-3 outline-none"
            />
          </div>

          {/* Summary */}

          <div className="mt-6 bg-[#1f1f1f] rounded-lg p-4 space-y-3">

            <div className="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-300">
              <span>GST ({taxRate}%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            {
              discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )
            }

            <hr className="border-[#3a3a3a]" />

            <div className="flex justify-between text-white text-lg font-bold">
              <span>Grand Total</span>
              <span>₹{finalAmount.toFixed(2)}</span>
            </div>

            <hr className="border-[#3a3a3a]" />

            <div className="flex justify-between text-gray-300">
              <span>Paid</span>
              <span>₹{totalPaid.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-300">
                Remaining
              </span>

              <span
                className={
                  remaining === 0
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                ₹{remaining.toFixed(2)}
              </span>
            </div>

            {
              change > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    Refund
                  </span>

                  <span className="text-yellow-400 font-bold">
                    ₹{change.toFixed(2)}
                  </span>
                </div>
              )
            }

          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                setShowDiscardDialog(true);
              } else {
                onClose();
              }
            }}
            className="w-full py-3 rounded-lg bg-[#444] text-white hover:bg-[#555]"
          >
            Cancel
          </button>

          <button
            disabled={!paymentCompleted}
            onClick={handleConfirmPayment}
            className={`w-full py-3 rounded-lg font-semibold transition ${paymentCompleted
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-[#555] text-gray-400 cursor-not-allowed"
              }`}
          >
            Confirm Payment
          </button>
        </div>
      </div>
      {
        showDiscardDialog && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-60">
            <div className="bg-[#2b2b2b] w-105 rounded-xl p-6">

              <h2 className="text-xl font-bold text-white">
                Discard Changes?
              </h2>

              <p className="text-gray-400 mt-3">
                Any tailoring prices, discount and payment details entered in this
                window will be lost.
              </p>

              <div className="flex gap-3 mt-8">

                <button
                  onClick={() => setShowDiscardDialog(false)}
                  className="flex-1 py-3 rounded-lg bg-[#444] text-white hover:bg-[#555]"
                >
                  Continue Editing
                </button>

                <button
                  onClick={() => {
                    setShowDiscardDialog(false);
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                  Discard
                </button>

              </div>

            </div>
          </div>
        )
      }
    </div>
  );
};

export default PaymentModal;