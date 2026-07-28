import { useState } from "react";
const RemainingPaymentModal = ({
    order,
    onClose,
    onSuccess,
}) => {

    const remainingAmount = order.paymentData.remainingAmount;
    const [cashAmount, setCashAmount] = useState("");
    const [upiAmount, setUpiAmount] = useState("");
    const cash = Number(cashAmount) || 0;
    const upi = Number(upiAmount) || 0;
    const totalPaid = cash + upi;
    const balance = Math.max(remainingAmount - totalPaid,0);
    const excess = Math.max(totalPaid - remainingAmount, 0);
    const paymentCompleted =
        totalPaid >= remainingAmount &&
        remainingAmount > 0;
    const handleSubmit = () => {
        onSuccess({
            cashAmount: cash,
            upiAmount: upi,
        });
    };
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-[#2b2b2b] rounded-xl w-107.5 p-6">
                <h2 className="text-2xl font-bold text-center text-white">
                    Remaining Payment
                </h2>
                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Remaining Amount
                    </p>
                    <h1 className="text-4xl font-bold text-yellow-400 mt-2">
                        ₹{remainingAmount.toFixed(2)}
                    </h1>
                </div>
                <div className="mt-8">
                    <label className="text-gray-300 block mb-2">
                        Cash
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={cashAmount}
                        onChange={(e)=>
                            setCashAmount(e.target.value)
                        }
                        className="w-full bg-[#1f1f1f] text-white rounded-lg p-3 outline-none"
                    />
                </div>
                <div className="mt-5">
                    <label className="text-gray-300 block mb-2">
                        UPI
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={upiAmount}
                        onChange={(e)=>
                            setUpiAmount(e.target.value)
                        }
                        className="w-full bg-[#1f1f1f] text-white rounded-lg p-3 outline-none"
                    />
                </div>
                <div className="mt-7 space-y-3">
                    <div className="flex justify-between text-gray-300">
                        <span>Total Paid</span>
                        <span>
                            ₹{totalPaid.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">
                            Balance
                        </span>
                        <span
                            className={
                                balance === 0
                                    ? "text-green-400 font-bold"
                                    : "text-red-400 font-bold"
                            }
                        >
                            ₹{balance.toFixed(2)}
                        </span>
                    </div>
                    {
                        excess > 0 &&
                        <div className="flex justify-between">
                            <span className="text-gray-300">
                                Refund
                            </span>
                            <span className="text-yellow-400 font-bold">
                                ₹{excess.toFixed(2)}
                            </span>
                        </div>
                    }
                </div>
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-lg bg-[#444] text-white"
                    >Cancel
                    </button>
                    <button
                        disabled={!paymentCompleted}
                        onClick={handleSubmit}
                        className={`w-full py-3 rounded-lg font-semibold transition ${
                            paymentCompleted
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-[#555] text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
export default RemainingPaymentModal;