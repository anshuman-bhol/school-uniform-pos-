import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { FaPlus, FaMinus, FaTrash, FaEdit, } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderBill } from "../../https";
import PriceModal from "../billing/PriceModal";
import { calculateBill } from "../../utils/calculateBill";
const ModifyBillModal = ({ order, onClose }) => {

    const [items, setItems] = useState(order.items.map(item => ({ ...item })));
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const queryClient = useQueryClient();
    const discount = order.bills?.discount || {
        type: "amount",
        value: 0,
        amount: 0,
    };

    const {
        subtotal,
        tax,
        totalWithTax,
        finalAmount,
        discountAmount
    } = calculateBill(
        items,
        discount
    );

    const updateQuantity = (_id, delta) => {
    setItems(prev =>
        prev.map(item => {
            if (item._id !== _id) return item;

            const quantity = Math.max(1, item.quantity + delta);

            return {
                ...item,
                quantity,
                price: quantity * item.pricePerQuantity,
            };
        })
    );
};

    const removeItem = (_id) => {
        setItems(prev =>
            prev.filter(
                item => item._id !== _id
            )
        );
    };

    const updateMutation = useMutation({

        mutationFn: () =>
            updateOrderBill({

                orderId: order._id,

                items,

                bills: {

                    total: subtotal,

                    tax,

                    totalWithTax,

                    finalAmount,

                    discount: order.bills.discount,

                },

            }),

        onSuccess: async () => {

            enqueueSnackbar(
                "Bill updated successfully",
                {
                    variant: "success",
                }
            );

            await queryClient.invalidateQueries({
                queryKey: ["order", order._id],
            });

            await queryClient.invalidateQueries({
                queryKey: ["orders"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["payment-ledger"],
            });

            onClose();
        },

        onError: (error) => {

            enqueueSnackbar(

                error?.response?.data?.message ||
                "Unable to update bill",

                {
                    variant: "error",
                }

            );

        },

    });

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

                <div className="bg-[#262626] rounded-xl w-225 max-h-[90vh] overflow-hidden flex flex-col font-semibold">

                    <div className="border-b border-[#3a3a3a] p-6">

                        <h2 className="text-2xl text-white font-bold">
                            Modify Bill
                        </h2>

                        <p className="text-gray-400 mt-1">
                            Invoice :
                            {" "}
                            {order.invoiceNumber}
                        </p>

                    </div>

                    <div className="flex-1 overflow-y-auto p-6">

                        {
                            items.map(item => (

                                <div
                                    key={item._id}
                                    className="bg-[#1f1f1f] rounded-lg p-4 mb-4"
                                >

                                    <div className="flex justify-between">

                                        <div>

                                            <h3 className="text-white font-semibold text-lg">
                                                {item.name}
                                            </h3>

                                            <p className="text-gray-400 text-sm mt-1">
                                                {item.school}
                                            </p>

                                            {
                                                item.size && (
                                                    <p className="text-gray-500 text-sm">
                                                        Size : {item.size}
                                                    </p>
                                                )
                                            }

                                            {
                                                item.colour && (
                                                    <p className="text-gray-500 text-sm">
                                                        Colour : {item.colour}
                                                    </p>
                                                )
                                            }
                                        </div>
                                        <div className="text-right">

                                            <p className="text-yellow-400 font-bold text-lg">
                                                ₹
                                                {item.price.toFixed(2)}
                                            </p>

                                            <p className="text-gray-400 text-sm">
                                                ₹
                                                {item.pricePerQuantity}
                                                {" × "}
                                                {item.quantity}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="flex justify-between items-center mt-5">

                                        <div className="flex items-center gap-3">

                                            <button disabled={updateMutation.isPending}
                                                onClick={() => updateQuantity(item._id, -1)}
                                                className="bg-red-500 p-2 rounded"
                                            >
                                                <FaMinus />
                                            </button>

                                            <span className="text-white font-bold text-lg w-8 text-center">
                                                {item.quantity}
                                            </span>

                                            <button disabled={updateMutation.isPending}
                                               onClick={() => updateQuantity(item._id, 1)}
                                                className="bg-green-500 p-2 rounded"
                                            >
                                                <FaPlus />
                                            </button>

                                        </div>

                                        <div className="flex gap-3">

                                            <button disabled={updateMutation.isPending}
                                                onClick={() => {

                                                    setSelectedItem(item);

                                                    setShowPriceModal(true);

                                                }}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded flex items-center gap-2"
                                            >
                                                <FaEdit />

                                                Edit Price

                                            </button>

                                            <button disabled={updateMutation.isPending}
                                                onClick={() => {
                                                    if (items.length === 1) {
                                                        enqueueSnackbar(
                                                            "Order must contain at least one item.",
                                                            { variant: "warning" }
                                                        );
                                                        return;
                                                    }

                                                    removeItem(item._id);
                                                }}
                                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2"
                                            >
                                                <FaTrash />

                                                Remove

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))
                        }

                    </div>
                    <div className="border-t border-[#3a3a3a] p-5">

                        <div className="grid grid-cols-2 gap-8">

                            <div>

                                <h3 className="text-lg font-semibold text-white mb-3">
                                    Bill Summary
                                </h3>

                                <div className="space-y-2">

                                    <div className="flex justify-between text-gray-300">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-gray-300">
                                        <span>GST</span>
                                        <span>₹{tax.toFixed(2)}</span>
                                    </div>

                                    {
                                        discountAmount > 0 && (
                                            <div className="flex justify-between text-red-400">
                                                <span>Discount</span>
                                                <span>- ₹{discountAmount.toFixed(2)}</span>
                                            </div>
                                        )
                                    }

                                    <div className="flex justify-between text-xl font-bold text-yellow-400 border-t border-[#444] pt-3">

                                        <span>Total</span>

                                        <span>
                                            ₹{finalAmount.toFixed(2)}
                                        </span>

                                    </div>

                                </div>

                            </div>

                            <div className="flex justify-end items-end gap-3">

                                <button
                                    onClick={onClose}
                                    disabled={updateMutation.isPending}
                                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded font-semibold"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => updateMutation.mutate()}
                                    disabled={updateMutation.isPending}
                                    className={`px-6 py-3 rounded font-semibold ${updateMutation.isPending
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700"
                                        }`}
                                >
                                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            </div>

            {
                showPriceModal && (
                    <PriceModal
                        item={selectedItem}
                        onClose={() => {
                            setShowPriceModal(false);
                            setSelectedItem(null);
                        }}
                        onSave={(unitPrice) => {

                            setItems(prev =>
                                prev.map(item =>
                                    item._id === selectedItem._id
                                        ? {
                                            ...item,
                                            pricePerQuantity: unitPrice,
                                            price: unitPrice * item.quantity,
                                        }
                                        : item
                                )
                            );

                            setShowPriceModal(false);
                            setSelectedItem(null);

                        }}
                    />
                )
            }

        </>
    );
};

export default ModifyBillModal;
