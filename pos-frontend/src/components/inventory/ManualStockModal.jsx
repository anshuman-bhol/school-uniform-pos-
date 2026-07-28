import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, updateStockManual } from "../../https";
import { enqueueSnackbar } from "notistack";

const ManualStockModal = ({ onClose, initialProduct = null, }) => {
    const { data, isFetching  } = useQuery({
        queryKey: ["products"],
        queryFn: getProducts,
    });
    console.log("ProductContainer render");
console.log("Fetching:", isFetching);
    const queryClient = useQueryClient();
    const categories = data?.data?.products || [];

    const allItems = categories.flatMap(category =>
        category.items.map(item => ({
            ...item,
            category: category.category,
        }))
    );
    const getProductKey = (item) => `${item.name}|${item.school}|${item.category}`;
    const [selectedProductKey, setSelectedProductKey] = useState(
        initialProduct
            ? `${initialProduct.item.name}|${initialProduct.item.school}|${initialProduct.category}`
            : ""
    );
    const selectedItem = allItems.find((item) => getProductKey(item) === selectedProductKey);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(() => {
        if (!initialProduct) return 0;

        const index = initialProduct.item.variants.findIndex(
            (v) =>
                v.size === initialProduct.variant.size &&
                (v.color || "") === (initialProduct.variant.color || "")
        );

        return index >= 0 ? index : 0;
    });
    const variant = selectedItem?.variants?.[selectedVariantIndex];
    const [newStock, setNewStock] = useState("");
    const [operation, setOperation] = useState("add");

    const stockMutation = useMutation({
        mutationFn: updateStockManual,
        onSuccess: async (res) => {
            enqueueSnackbar(
                res.data.message,
                {
                    variant: "success",
                }
            );
            console.log("Invalidating products...");
            await queryClient.invalidateQueries({
                queryKey: ["products"],
                type: "active",
            });
            console.log("Invalidated");
            queryClient.invalidateQueries({
                queryKey: ["stock-history"],
            });

            onClose();

        },

        onError: (error) => {

            enqueueSnackbar(
                error.response?.data?.message ||
                "Unable to update stock",
                {
                    variant: "error",
                }
            );

        },

    });

    return (

        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

            <div className="bg-[#1a1a1a] rounded-xl w-137.5 p-6">

                <h2 className="text-2xl font-semibold text-white mb-6">
                    Manual Stock Update
                </h2>

                <div className="mb-5">

                    <label className="text-gray-400 text-sm">
                        Adjustment Type
                    </label>

                    <div className="flex gap-6 mt-3">

                        <label className="flex items-center gap-2 text-white cursor-pointer">

                            <input
                                type="radio"
                                checked={operation === "add"}
                                onChange={() => setOperation("add")}
                            />

                            Receive Stock

                        </label>

                        <label className="flex items-center gap-2 text-white cursor-pointer">

                            <input
                                type="radio"
                                checked={operation === "set"}
                                onChange={() => setOperation("set")}
                            />
                            Set Stock
                        </label>
                    </div>
                </div>
                {
                    !initialProduct && (
                        <>
                            {/* Product */}
                            <label className="text-gray-400 text-sm">
                                Product
                            </label>

                            <select
                                className="w-full mt-2 mb-5 bg-[#202020] rounded-lg p-3 text-white"
                                value={selectedProductKey}
                                onChange={(e) => {
                                    setSelectedProductKey(e.target.value);
                                    setSelectedVariantIndex(0);
                                }}
                            >
                                <option value="">
                                    Select Product
                                </option>

                                {allItems.map((item) => (
                                    <option
                                        key={getProductKey(item)}
                                        value={getProductKey(item)}
                                    >
                                        {item.name} | {item.school} | {item.category}
                                    </option>
                                ))}
                            </select>
                        </>
                    )
                }
                {
                    selectedItem && (
                        <>
                            <label className="text-gray-400 text-sm">
                                Variant
                            </label>
                            <select
                                className="w-full mt-2 mb-5 bg-[#202020] rounded-lg p-3 text-white"
                                value={selectedVariantIndex}
                                onChange={(e) =>
                                    setSelectedVariantIndex(
                                        Number(e.target.value)
                                    )
                                }
                            >
                                {selectedItem.variants.map((v, index) => (
                                    <option
                                        key={index}
                                        value={index}
                                    >
                                        Size : {v.size} | Colour : {v.color || "-"}
                                    </option>
                                ))}
                            </select>
                            <div className="space-y-3 text-white">
                                <p>
                                    <strong>Category :</strong>{" "}
                                    {selectedItem.category}
                                </p>
                                <p>
                                    <strong>School :</strong>{" "}
                                    {selectedItem.school || "-"}
                                </p>
                                <p>
                                    <strong>Current Stock :</strong>{" "}
                                    {variant?.stock}
                                </p>
                            </div>
                            <div className="mt-5">
                                <label className="text-gray-400 text-sm font-medium">
                                    {operation === "add"
                                        ? "Quantity Received"
                                        : "Set Stock"}
                                </label>
                                <input
                                    type="number"
                                    value={newStock}
                                    onChange={(e) =>
                                        setNewStock(e.target.value)
                                    }
                                    className="w-full mt-2 bg-[#202020] rounded-lg p-3 text-white outline-none"
                                />
                                {
                                    variant && newStock !== "" && (
                                        <p className="text-green-400 mt-3">
                                            New Stock :
                                            {" "}
                                            {
                                                operation === "add"
                                                    ? Number(variant.stock) + Number(newStock)
                                                    : Number(newStock)
                                            }
                                        </p>
                                    )
                                }
                            </div>
                        </>
                    )
                }
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-red-700 text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (!selectedItem || !variant) return;

                            stockMutation.mutate({
                                productName: selectedItem.name,
                                school: selectedItem.school,
                                size: variant.size,
                                colour: variant.color,
                                quantity: Number(newStock),
                                operation,
                            });
                        }}
                        className="px-5 py-2 rounded-lg bg-green-700 text-white"
                    >
                        Update Stock
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ManualStockModal;