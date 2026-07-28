import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaPlus, FaMinus, FaUndo } from "react-icons/fa";
import { createReturn, createExchange, getProducts } from "../../https";
import { useQuery } from "@tanstack/react-query";

const ReturnExchangeModal = ({
    order,
    onClose,
}) => {

    const queryClient = useQueryClient();
    const [mode, setMode] = useState("return");
    const [reason, setReason] = useState("");
    const [cashRefund, setCashRefund] = useState("");
    const [upiRefund, setUpiRefund] = useState("");
    const [items, setItems] = useState(

        order.items.filter(
            item => item.itemType === "ReadyMade"
        )

            .map(item => ({
                ...item,
                selected: false,
                returnQuantity: 1,
                returnedQuantity: item.returnedQuantity || 0,
                exchangeSchool: item.school,
                exchangeSize: item.size,
                availableSchools: [],
                availableSizes: [],
            }))
    );

    const { data: productRes } = useQuery({
        queryKey: ["products"],
        queryFn: getProducts,
    });

    const products = productRes?.data?.products || [];

    /*
    -----------------------------------------
    Available Quantity
    -----------------------------------------
    */

    const getAvailableQuantity = (item) => {

        return (
            item.quantity
        );

    };

    /*
    -----------------------------------------
    Select Item
    -----------------------------------------
    */

    const toggleItem = (_id) => {

        setItems(prev =>

            prev.map(item =>

                item._id === _id

                    ? {

                        ...item,

                        selected: !item.selected,

                        returnQuantity: 1,

                    }

                    : item

            )

        );

    };

    /*
    -----------------------------------------
    Increase Qty
    -----------------------------------------
    */

    const increaseQty = (_id) => {

        setItems(prev =>

            prev.map(item => {

                if (item._id !== _id)
                    return item;

                const available =
                    getAvailableQuantity(item);

                if (
                    item.returnQuantity >=
                    available
                ) {

                    return item;

                }

                return {

                    ...item,

                    returnQuantity:
                        item.returnQuantity + 1,

                };

            })

        );

    };

    /*
    -----------------------------------------
    Decrease Qty
    -----------------------------------------
    */

    const decreaseQty = (_id) => {

        setItems(prev =>

            prev.map(item => {

                if (item._id !== _id)
                    return item;

                return {

                    ...item,

                    returnQuantity:
                        Math.max(
                            1,
                            item.returnQuantity - 1
                        ),

                };

            })

        );

    };

    /*
    -----------------------------------------
    Refund Calculation
    -----------------------------------------
    */

    const refundAmount = useMemo(() => {
        return items.reduce(
            (total, item) => {
                if (!item.selected)
                    return total;
                return (total + item.returnQuantity * item.pricePerQuantity);
            }, 0
        );
    }, [items]);

    /*
    -----------------------------------------
    Validation
    -----------------------------------------
    */

    const isRefundValid =
        Number(cashRefund || 0) +
        Number(upiRefund || 0)
        === refundAmount;

    const selectedExchangeItem = items.find(item => item.selected);

    const selectedProduct =
        selectedExchangeItem
            ? products
                .flatMap(category => category.items)
                .find(
                    product =>
                        product.name === selectedExchangeItem.name &&
                        product.school === selectedExchangeItem.exchangeSchool
                )
            : null;

    const exchangeDifference = useMemo(() => {

        if (!selectedExchangeItem || !selectedProduct)
            return 0;

        return (
            (selectedProduct.sellingPrice -
                selectedExchangeItem.pricePerQuantity)
            *
            selectedExchangeItem.returnQuantity
        );

    }, [
        selectedExchangeItem,
        selectedProduct
    ]);

    const refundRequired =
        exchangeDifference < 0
            ? Math.abs(exchangeDifference)
            : 0;

    const paymentRequired =
        exchangeDifference > 0
            ? exchangeDifference
            : 0;

    const exchangePaymentValid =
        paymentRequired === 0
            ? true
            : (
                Number(cashRefund || 0) +
                Number(upiRefund || 0)
            ) === paymentRequired;

    const exchangeRefundValid =
        refundRequired === 0
            ? true
            : (
                Number(cashRefund || 0) +
                Number(upiRefund || 0)
            ) === refundRequired;

    const isExchangeValid =
        selectedExchangeItem &&
        selectedExchangeItem.exchangeSchool &&
        selectedExchangeItem.exchangeSize &&
        (
            selectedExchangeItem.exchangeSchool !== selectedExchangeItem.school ||
            selectedExchangeItem.exchangeSize !== selectedExchangeItem.size
        );
    /*
    -----------------------------------------
    Mutation
    -----------------------------------------
    */

    const returnMutation = useMutation({
        mutationFn: () => {
            const returnedItems =
                items
                    .filter(item => item.selected)
                    .map(item => ({
                        itemId: item.itemId,
                        name: item.name,
                        itemType: item.itemType,
                        school: item.school,
                        size: item.size,
                        colour: item.colour,
                        quantity: item.returnQuantity,
                        pricePerQuantity: item.pricePerQuantity,
                        amount: item.returnQuantity * item.pricePerQuantity,
                    }));

            return createReturn({
                orderId: order._id,
                returnedItems,
                refund: {
                    cash: Number(cashRefund),
                    upi: Number(upiRefund),
                    total: refundAmount,
                },
                reason,
            });
        },

        onSuccess: async () => {
            enqueueSnackbar(
                "Return processed successfully",
                {
                    variant: "success",
                }
            );

            await queryClient.refetchQueries({
                queryKey: ["order", order._id],
            });

            await queryClient.refetchQueries({
                queryKey: ["orders"],
            });

            await queryClient.refetchQueries({
                queryKey: ["payment-ledger"],
            });

            onClose();

        },

        onError: error => {

            enqueueSnackbar(

                error.response?.data?.message ||

                "Unable to process return",

                {

                    variant: "error",

                }

            );

        },

    });

    const exchangeMutation = useMutation({

        mutationFn: () => {

            const selectedItem = items.find(item => item.selected);

            if (!selectedItem) {
                throw new Error("Please select an item.");
            }

            if (
                !selectedItem.exchangeSchool ||
                !selectedItem.exchangeSize
            ) {
                throw new Error("Please select exchange school and size.");
            }

            return createExchange({

                orderId: order._id,

                returnedItem: {
                    orderItemId: selectedItem._id,
                    itemId: selectedItem.itemId,
                    name: selectedItem.name,
                    itemType: selectedItem.itemType,
                    school: selectedItem.school,
                    size: selectedItem.size,
                    colour: selectedItem.colour,
                    quantity: selectedItem.returnQuantity,
                    pricePerQuantity: selectedItem.pricePerQuantity,
                    amount:
                        selectedItem.returnQuantity *
                        selectedItem.pricePerQuantity,
                },

                exchangedItem: {

                    school: selectedItem.exchangeSchool,

                    size: selectedItem.exchangeSize,

                    quantity: selectedItem.returnQuantity,

                },

                refund: {
                    cash:
                        exchangeDifference < 0
                            ? Number(cashRefund)
                            : 0,

                    upi:
                        exchangeDifference < 0
                            ? Number(upiRefund)
                            : 0,

                    total:
                        exchangeDifference < 0
                            ? Math.abs(exchangeDifference)
                            : 0,
                },

                additionalPayment: {
                    cash:
                        exchangeDifference > 0
                            ? Number(cashRefund)
                            : 0,

                    upi:
                        exchangeDifference > 0
                            ? Number(upiRefund)
                            : 0,

                    total:
                        exchangeDifference > 0
                            ? exchangeDifference
                            : 0,
                },

                reason,

            });

        },

        onSuccess: async () => {

            enqueueSnackbar(
                "Exchange completed successfully",
                {
                    variant: "success",
                }
            );

            await queryClient.refetchQueries({
                queryKey: ["order", order._id],
            });

            await queryClient.refetchQueries({
                queryKey: ["orders"],
            });

            await queryClient.refetchQueries({
                queryKey: ["products"],
            });

            await queryClient.refetchQueries({
                queryKey: ["payment-ledger"],
            });

            onClose();

        },

        onError: error => {

            enqueueSnackbar(

                error.response?.data?.message ||

                "Unable to process exchange",

                {
                    variant: "error",
                }

            );

        },

    });

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 font-light">
            <div className="bg-[#262626] rounded-xl w-212.5 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b border-[#3a3a3a] p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FaUndo />
                            {mode === "return"
                                ? "Return Items"
                                : "Exchange Items"}
                        </h2>
                        <div className="flex bg-[#1f1f1f] rounded-lg overflow-hidden">
                            <button
                                onClick={() => setMode("return")}
                                className={`px-5 py-2 ${mode === "return"
                                    ? "bg-blue-500"
                                    : "text-white"
                                    }`}
                            >
                                Return
                            </button>
                            <button
                                onClick={() => setMode("exchange")}
                                className={`px-5 py-2 ${mode === "exchange"
                                    ? "bg-green-600"
                                    : "text-white"
                                    }`}
                            >
                                Exchange
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-400 mt-2">
                        Invoice :{" "}{order.invoiceNumber}
                    </p>
                    <p className="text-gray-400">
                        Customer :{" "}{order.customerDetails.name}
                    </p>
                </div>
                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {
                        items.length === 0 ?
                            (
                                <div className="text-center text-gray-400 py-10">
                                    No ReadyMade items available.
                                </div>
                            ) :
                            items.map(item => {
                                const available = getAvailableQuantity(item);
                                const matchingProducts = products.flatMap(category =>
                                    category.items.filter(
                                        product =>
                                            product.name.trim().toLowerCase() ===
                                            item.name.trim().toLowerCase()
                                    )
                                );
                                const selectedProduct = matchingProducts.find(
                                    product => product.school === item.exchangeSchool
                                );
                                return (
                                    <div key={item._id} className="bg-[#1f1f1f] rounded-xl p-5 mb-5">
                                        <div className="flex justify-between font-medium">
                                            <div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.selected}
                                                        onChange={() =>
                                                            toggleItem(item._id)
                                                        }
                                                    />
                                                    <span className="text-lg text-white font-semibold">{item.name}</span>
                                                </label>
                                                <p className="text-gray-400 mt-2">
                                                    Purchased :{" "}{item.quantity}
                                                </p>
                                                <p className="text-gray-400">
                                                    Already Returned :{" "}{item.returnedQuantity}
                                                </p>
                                                <p className="text-yellow-400">
                                                    Available :{" "}{available}
                                                </p>
                                                {
                                                    item.size &&
                                                    <p className="text-gray-500">
                                                        Size :{" "}{item.size}
                                                    </p>
                                                }
                                                {
                                                    item.colour &&
                                                    <p className="text-gray-500">
                                                        Colour :{" "}{item.colour}
                                                    </p>
                                                }
                                            </div>
                                            <div className="text-right">
                                                <p className="text-green-400 text-xl font-bold">₹{item.pricePerQuantity.toFixed(2)}</p>
                                                <p className="text-gray-400">per item</p>
                                            </div>
                                        </div>
                                        {
                                            item.selected && (
                                                <>
                                                    {mode === "exchange" && (
                                                        <div className="mt-6 grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-gray-400">Exchange School</label>



                                                                <select
                                                                    value={item.exchangeSchool}
                                                                    onChange={(e) => {
                                                                        const school = e.target.value;
                                                                        setItems(prev =>
                                                                            prev.map(i =>
                                                                                i._id === item._id
                                                                                    ? {
                                                                                        ...i,
                                                                                        exchangeSchool: school,
                                                                                        exchangeSize: "",
                                                                                    }
                                                                                    : i
                                                                            )
                                                                        );

                                                                    }}
                                                                    className="mt-2 w-full bg-[#333] rounded-lg p-3 text-white"
                                                                >
                                                                    <option value="">Select School</option>
                                                                    {[
                                                                        ...new Set(
                                                                            matchingProducts
                                                                                .map(product => product.school)
                                                                                .filter(Boolean)
                                                                        ),
                                                                    ].map(school => (
                                                                        <option key={school} value={school}>
                                                                            {school}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-gray-400">Exchange Size</label>
                                                                <select
                                                                    value={item.exchangeSize}
                                                                    onChange={(e) => {
                                                                        setItems(prev =>
                                                                            prev.map(i =>
                                                                                i._id === item._id
                                                                                    ? {
                                                                                        ...i,
                                                                                        exchangeSize: e.target.value,
                                                                                    }
                                                                                    : i
                                                                            )
                                                                        );

                                                                    }}

                                                                    className="mt-2 w-full bg-[#333] rounded-lg p-3 text-white"

                                                                >

                                                                    <option value="">
                                                                        Select Size
                                                                    </option>

                                                                    {[
                                                                        ...new Map(
                                                                            (selectedProduct?.variants || [])
                                                                                .filter(v => v.stock > 0)
                                                                                .map(v => [v.size, v])
                                                                        ).values(),
                                                                    ].map(variant => (
                                                                        <option
                                                                            key={variant.size}
                                                                            value={variant.size}
                                                                        >
                                                                            {variant.size}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mt-6 flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() =>
                                                                    decreaseQty(item._id)
                                                                }
                                                                className="bg-red-600 p-2 rounded"
                                                            ><FaMinus />
                                                            </button>
                                                            <span className="text-white text-xl w-10 text-center">
                                                                {item.returnQuantity}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    increaseQty(item._id)
                                                                }
                                                                className="bg-green-600 p-2 rounded"
                                                            ><FaPlus />
                                                            </button>
                                                        </div>
                                                        <div className="text-yellow-400 text-xl font-bold">Refund :{" "}₹{(item.returnQuantity * item.pricePerQuantity).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        }
                                    </div>
                                );
                            })
                    }
                </div>
                {/* Footer */}
                <div className="border-t border-[#3a3a3a] p-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {mode === "return"
                                    ? "Refund Summary"
                                    : "Exchange Summary"}
                            </h3>
                            {mode === "return" ? (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Refund Amount</span>
                                            <span className="text-yellow-400 font-bold">₹{refundAmount.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <label className="text-gray-300">Cash Refund</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={cashRefund}
                                                onChange={(e) =>
                                                    setCashRefund(e.target.value)
                                                }
                                                className="mt-2 w-full bg-[#1f1f1f] rounded-lg p-3 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-gray-300">
                                                UPI Refund
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={upiRefund}
                                                onChange={(e) =>
                                                    setUpiRefund(e.target.value)
                                                }
                                                className="mt-2 w-full bg-[#1f1f1f] rounded-lg p-3 text-white"
                                            />
                                        </div>
                                        {
                                            !isRefundValid && refundAmount > 0 && (
                                                <p className="text-red-400">
                                                    Cash + UPI refund must equal ₹
                                                    {refundAmount.toFixed(2)}

                                                </p>
                                            )
                                        }
                                    </div>
                                </>)
                                :
                                <>
                                    <div className="flex justify-between mb-4">
                                        <span className="text-gray-300">Difference</span>
                                        <span
                                            className={
                                                exchangeDifference > 0
                                                    ? "text-red-400 font-bold"
                                                    : exchangeDifference < 0
                                                        ? "text-green-400 font-bold"
                                                        : "text-yellow-400 font-bold"
                                            }
                                        >
                                            ₹{Math.abs(exchangeDifference).toFixed(2)}
                                        </span>
                                    </div>

                                    {exchangeDifference > 0 && (
                                        <>
                                            <p className="text-red-400 mb-3">
                                                Customer has to pay ₹
                                                {paymentRequired.toFixed(2)}
                                            </p>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-gray-300">
                                                        Cash Payment
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={cashRefund}
                                                        onChange={(e) =>
                                                            setCashRefund(e.target.value)
                                                        }
                                                        className="mt-2 w-full bg-[#1f1f1f] rounded-lg p-3 text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-gray-300">
                                                        UPI Payment
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={upiRefund}
                                                        onChange={(e) =>
                                                            setUpiRefund(e.target.value)
                                                        }
                                                        className="mt-2 w-full bg-[#1f1f1f] rounded-lg p-3 text-white"
                                                    />
                                                </div>

                                                {!exchangePaymentValid && (
                                                    <p className="text-red-400">
                                                        Cash + UPI must equal ₹
                                                        {paymentRequired.toFixed(2)}
                                                    </p>
                                                )}

                                            </div>
                                        </>
                                    )}

                                    {exchangeDifference < 0 && (
                                        <>
                                            <p className="text-green-400 mb-3">
                                                Refund customer ₹
                                                {refundRequired.toFixed(2)}
                                            </p>

                                            <div className="space-y-3">

                                                <div>
                                                    <label className="text-gray-300">
                                                        Cash Refund
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={cashRefund}
                                                        onChange={(e) =>
                                                            setCashRefund(e.target.value)
                                                        }
                                                        className="mt-2 w-full bg-[#1f1f1f] rounded-lg p-3 text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-gray-300">
                                                        UPI Refund
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={upiRefund}
                                                        onChange={(e) =>
                                                            setUpiRefund(e.target.value)
                                                        }
                                                        className="mt-2 w-full bg-[#1f1f1f] rounded-lg p-3 text-white"
                                                    />
                                                </div>

                                                {!exchangeRefundValid && (
                                                    <p className="text-red-400">
                                                        Cash + UPI must equal ₹
                                                        {refundRequired.toFixed(2)}
                                                    </p>
                                                )}

                                            </div>
                                        </>
                                    )}

                                    {exchangeDifference === 0 && (
                                        <p className="text-blue-400">
                                            Even exchange. No payment required.
                                        </p>
                                    )}
                                </>
                            }
                        </div>
                        <div>
                            <label className="text-gray-300">
                                Reason
                            </label>
                            <textarea
                                rows={7}
                                value={reason}
                                onChange={(e) =>
                                    setReason(e.target.value)
                                }
                                placeholder="Reason for return..."
                                className="mt-2 w-full bg-[#1f1f1f] rounded-lg p-3 text-white resize-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="bg-gray-700 hover:bg-gray-800 px-6 py-3 rounded-lg text-white"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={
                                mode === "return"
                                    ? (
                                        returnMutation.isPending ||
                                        refundAmount === 0 ||
                                        !isRefundValid
                                    )
                                    : (
                                        exchangeMutation.isPending ||
                                        !(
                                            isExchangeValid &&
                                            exchangePaymentValid &&
                                            exchangeRefundValid
                                        )
                                    )
                            }
                            onClick={() =>
                                mode === "return"
                                    ? returnMutation.mutate()
                                    : exchangeMutation.mutate()
                            }
                            className={`px-6 py-3 rounded-lg font-semibold ${(
                                mode === "return"
                                    ? returnMutation.isPending
                                    : exchangeMutation.isPending
                            )
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            {
                                (
                                    mode === "return"
                                        ? returnMutation.isPending
                                        : exchangeMutation.isPending
                                )
                                    ? "Processing..."
                                    : mode === "return"
                                        ? "Process Return"
                                        : "Process Exchange"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnExchangeModal;

