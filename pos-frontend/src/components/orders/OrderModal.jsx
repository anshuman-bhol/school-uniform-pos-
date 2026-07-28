import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrderById } from "../../https";
import ReturnExchangeModal from "../returnExchange/ReturnExchangeModal";
import { updateOrderPayment, updateOrderStatus, } from "../../https";
import RemainingPaymentModal from "../payment/RemainingPaymentModal";
import ModifyBillModal from "../orders/ModifyBillModal";
import Invoice from "../invoice/Invoice";
const OrderDetailsModal = ({ order, onClose }) => {

    const [showInvoice, setShowInvoice] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [showReturnExchangeModal, setShowReturnExchangeModal] = useState(false);
    const { data } = useQuery({
        queryKey: ["order", order._id],
        queryFn: () => getOrderById(order._id),
        enabled: !!order,
    });
    const currentOrder = data?.data?.data || order;
    const queryClient = useQueryClient();
    const paymentMutation = useMutation({
        mutationFn: ({ orderId, paymentData }) =>
            updateOrderPayment({
                orderId,
                paymentData,
            }),

        onSuccess: () => {
            enqueueSnackbar(
                "Payment updated successfully",
                {
                    variant: "success",
                }
            );
            queryClient.invalidateQueries({
                queryKey: ["orders"],
            });
            queryClient.invalidateQueries({
                queryKey: ["order", currentOrder._id],
            });
            setShowPaymentModal(false);
        },
        onError: (error) => {
            enqueueSnackbar(
                error?.response?.data?.message ||
                "Unable to update payment",
                {
                    variant: "error",
                }
            );
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ orderId, readyMadeStatus, tailoringStatus, }) =>
            updateOrderStatus({
                orderId,
                readyMadeStatus,
                tailoringStatus,
            }),

        onSuccess: () => {
            enqueueSnackbar(
                "Order status updated",
                {
                    variant: "success",
                }
            );

            queryClient.invalidateQueries({
                queryKey: ["orders"],
            });
            queryClient.invalidateQueries({
                queryKey: ["order", currentOrder._id],
            });


        },

        onError: (error) => {
            enqueueSnackbar(
                error?.response?.data?.message ||
                "Unable to update order",
                {
                    variant: "error",
                }
            );
        },
    });
    if (!order) return null;
    const readyMadeStatus = currentOrder.orderStatus?.readyMade?.status;
    const tailoringStatus = currentOrder.orderStatus?.tailoring?.status;

    const hasReadyMade = !!currentOrder.orderStatus?.readyMade;
    const hasTailoring = !!currentOrder.orderStatus?.tailoring;

    const discount = currentOrder.bills?.discount || {
        type: "amount",
        value: 0,
        amount: 0,
    };

    const finalAmount = currentOrder.bills?.finalAmount ?? currentOrder.bills.totalWithTax;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 text-center">
                <div className="bg-[#262626] text-white rounded-lg p-6 w-137.5 max-h-[90vh] overflow-y-auto scrollbar-none scrollbar-track-transparent">

                    <h2 className="text-xl font-bold mb-4">Order Details</h2>
                    <p className="mb-3 text-yellow-400 font-semibold">Invoice : {currentOrder.invoiceNumber}</p>
                    <p><strong>Customer:</strong> {currentOrder.customerDetails.name}</p>
                    <p><strong>Delivery Date:</strong> {new Date(currentOrder.customerDetails.deliveryDate).toLocaleDateString()}</p>
                    <p><strong>Remarks:</strong> {currentOrder.customerDetails.remarks || "-"}</p>
                    {hasReadyMade && (
                        <p>
                            <strong>Ready-made :</strong>{" "}
                            <span className="text-green-400">
                                {readyMadeStatus}
                            </span>
                        </p>
                    )}

                    {hasTailoring && (
                        <p>
                            <strong>Tailoring :</strong>{" "}
                            <span className="text-yellow-400">
                                {tailoringStatus}
                            </span>
                        </p>
                    )}
                    {hasTailoring && (
                        <p><strong>Tailor :</strong>{" "}{currentOrder.tailor ? currentOrder.tailor.name : "Not Assigned"}</p>
                    )}
                    <p><strong>Discount:</strong>{" "}{discount.type === "percentage" ? `${discount.value.toFixed(2)}%` : `₹${discount.amount.toFixed(2)}`}</p>
                    <p><strong>Total :</strong>₹{finalAmount.toFixed(2)}</p>
                    <p><strong>Advance Paid :</strong>₹{(currentOrder.paymentData?.advancePaid || 0).toFixed(2)}</p>
                    <p><strong>Remaining :</strong>₹{(currentOrder.paymentData?.remainingAmount || 0).toFixed(2)}</p>
                    <p><strong>Payment :</strong>{currentOrder.paymentStatus}</p>
                    <p><strong>Method :</strong>{currentOrder.paymentMethod || "-"}</p>
                    <hr className="my-4 border-gray-600" />
                    <h3 className="font-semibold mb-2">Items</h3>
                    <div className="max-h-45 overflow-y-auto">
                        {currentOrder.items.map((item, index) => (
                            <div key={index} className="border-b border-gray-700 py-2 font-medium">
                                <p className="font-medium">{item.name}</p>
                                <div className="text-sm text-gray-400 space-y-1">
                                    <p>Qty : {item.quantity}</p>
                                    {item.size && (<p>Size : {item.size}</p>)}
                                    {item.colour && (<p>Colour : {item.colour}</p>)}
                                    {item.school && (<p>School : {item.school}</p>)}
                                </div>
                                <p className="mt-1 text-green-400 font-medium">
                                    ₹{item.pricePerQuantity.toFixed(2)} × {item.quantity}
                                    = ₹{(
                                        item.pricePerQuantity *
                                        (item.quantity)
                                    ).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setShowInvoice(true)} className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded mt-5 font-medium">Reprint Receipt</button>
                    <button
                        onClick={() => setShowModifyModal(true)}
                        className="ml-3 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded mt-5 font-medium"
                    >
                        Modify Bill
                    </button>
                    <button
                        onClick={() => setShowReturnExchangeModal(true)}
                        className="ml-3 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded mt-5 font-medium"
                    >
                        Return / Exchange
                    </button>
                    {tailoringStatus === "Tailor Assigned" && (
                        <button
                            onClick={() =>
                                statusMutation.mutate({
                                    orderId: currentOrder._id,
                                    tailoringStatus: "Stitching",
                                })
                            }
                            className="ml-3 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded mt-5"
                        >Start Stitching
                        </button>
                    )}

                    {tailoringStatus === "Stitching" && (
                        <button
                            onClick={() =>
                                statusMutation.mutate({
                                    orderId: currentOrder._id,
                                    tailoringStatus: "Ready",
                                })
                            }
                            className="ml-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mt-5"
                        >Mark Ready
                        </button>
                    )}

                    {tailoringStatus === "Ready" &&
                        currentOrder.paymentStatus === "Paid" && (
                            <button
                                onClick={() =>
                                    statusMutation.mutate({
                                        orderId: currentOrder._id,
                                        tailoringStatus: "Delivered",
                                    })
                                }
                                className="ml-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded mt-5"
                            >
                                Deliver
                            </button>
                        )}
                    {tailoringStatus === "Ready" &&
                        currentOrder.paymentStatus !== "Paid" && (
                            <p className="mt-4 text-red-400 font-medium">
                                Collect the remaining payment before delivery.
                            </p>
                        )}
                    {
                        (currentOrder.paymentData?.remainingAmount || 0) > 0 && (
                            <button onClick={() => setShowPaymentModal(true)}
                                className="ml-3 bg-green-600 px-4 py-2 rounded mt-5"
                            > Collect Remaining Payment
                            </button>
                        )
                    }
                    <button onClick={onClose} className="ml-3 bg-red-500 px-4 py-2 rounded mt-5 font-medium">Close</button>
                </div>
            </div>
            {
                showModifyModal && (
                    <ModifyBillModal
                        order={currentOrder}
                        onClose={() => setShowModifyModal(false)}
                    />
                )
            }
            {
                showInvoice && (
                    <Invoice
                        orderInfo={currentOrder}
                        onClose={() => setShowInvoice(false)}
                    />
                )
            }
            {
                showPaymentModal && (
                    <RemainingPaymentModal
                        order={currentOrder}
                        onClose={() =>
                            setShowPaymentModal(false)
                        }
                        onSuccess={(paymentData) =>
                            paymentMutation.mutate({
                                orderId: currentOrder._id,
                                paymentData,
                            })
                        }
                    />
                )
            }
            {
                showReturnExchangeModal && (
                    <ReturnExchangeModal
                        order={currentOrder}
                        onClose={() =>
                            setShowReturnExchangeModal(false)
                        }
                    />
                )
            }
        </>
    );
};

export default OrderDetailsModal;