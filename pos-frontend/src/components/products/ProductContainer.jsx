import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { GrRadialSelected } from "react-icons/gr";
import { FaCartShopping } from "react-icons/fa6";
import { enqueueSnackbar } from "notistack";
import { addItems } from "../../redux/slices/cartSlice";
import { getProducts } from "../../https";
import CreateOrderModal from "../customer/CreateOrderModal";
import ManualStockModal from "../inventory/ManualStockModal";

const ProductContainer = () => {
    const dispatch = useDispatch();

    const customerData = useSelector(
        (state) => state.customer
    );

    const [selectedSchool, setSelectedSchool] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedVariant, setSelectedVariant] = useState({});
    const [itemCounts, setItemCounts] = useState({});
    const [pendingItem, setPendingItem] = useState(null);
    const [initialCustomer, setInitialCustomer] = useState(null);
    const [navigateAfterCreate, setNavigateAfterCreate] = useState(false);
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
    const [purchaseMode, setPurchaseMode] = useState({});
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedStockItem, setSelectedStockItem] = useState(null);

    const { data } = useQuery({ queryKey: ["products"], queryFn: getProducts, });
    console.log("Products Query:", data?.data?.products);
    const categories = useMemo(() => data?.data?.products || [], [data]);
    console.log("Products Updated");
    console.log(categories);
    const groupedProducts = useMemo(() => {
        const grouped = {};
        categories.forEach((category) => {
            category.items.forEach((item) => {
                const school = item.school || "General";
                if (!grouped[school]) {
                    grouped[school] = {};
                }
                if (!grouped[school][category.category]) {
                    grouped[school][category.category] = [];
                }
                grouped[school][category.category].push(item);
            });
        });
        return grouped;
    }, [categories]);
    const cartData = useSelector((state) => state.cart);
    const schools = Object.keys(groupedProducts);
    const activeSchool = selectedSchool || schools[0] || "";
    const availableCategories = groupedProducts[activeSchool] || {};
    const categoryNames = Object.keys(availableCategories);
    const activeCategory = selectedCategory || categoryNames[0] || "";
    const products = availableCategories[activeCategory] || [];
    const hasTailoringItems =
        cartData?.some(
            (item) => item.itemType === "Tailoring"
        ) ||
        purchaseMode[pendingItem?.item?._id] === "Tailoring";


    //-----------------------------------
    // Quantity
    //-----------------------------------

    const increment = (key, stock, itemType) => {
        setItemCounts((prev) => {
            const current = prev[key] || 0;
            if (itemType === "ReadyMade" && current >= stock) {
                enqueueSnackbar("Insufficient Stock", { variant: "warning", });
                return prev;
            }
            return { ...prev, [key]: current + 1, };
        });
    };

    const decrement = (key) => {
        setItemCounts((prev) => ({
            ...prev,
            [key]: prev[key] > 0
                ? prev[key] - 1
                : 0,
        }));
    };

    //-----------------------------------
    // Add Cart
    //-----------------------------------

    const addItemToCart = (item, variant) => {
        const key = `${item._id}-${variant.size}-${variant.color}`;
        const quantity = itemCounts[key] || 0;
        const mode = purchaseMode[item._id] || "ReadyMade";
        if (quantity === 0) return;
        dispatch(
            addItems({
                id: crypto.randomUUID(),
                itemId: item._id,
                name: item.name,
                itemType: mode,
                school: item.school,
                size: mode === "Tailoring" ? "" : variant.size,
                colour: variant.color,
                quantity,
                pricePerQuantity: mode === "Tailoring" ? 0 : item.sellingPrice,
                price: mode === "Tailoring" ? 0 : item.sellingPrice * quantity,
                customPrice: mode === "Tailoring",
            })
        );

        setItemCounts((prev) => ({ ...prev, [key]: 0, }));
        enqueueSnackbar("Added to cart", {
            variant: "success",
        });

    };

    //-----------------------------------
    // Customer Validation
    //-----------------------------------

    const handleAddToCart = (item, variant) => {
        if (!customerData.customerName) {
            setPendingItem({ item, variant, });
            setInitialCustomer(null);
            setNavigateAfterCreate(true);
            setShowCreateOrderModal(true);
            return;
        }
        addItemToCart(item, variant);
    };

    return (
        <>
            <div className="h-full flex flex-col">
                {/* Schools */}

                <div className="flex px-10 pt-1 gap-4 flex-wrap ">
                    {schools.map((school) => (
                        <div key={school} onClick={() => { setSelectedSchool(school); setSelectedCategory(""); }} className="bg-[#1a1a1a] rounded-lg p-4 cursor-pointer ">
                            <div className="flex justify-between gap-4">
                                <h2 className="text-white font-bold pt-1">{school}</h2>
                                {activeSchool === school && (<GrRadialSelected className="text-white" />)}
                            </div>
                        </div>
                    ))}
                </div>
                <hr className="border-[#2a2a2a] my-3" />

                {/* Categories */}
                <div className="flex gap-4 px-10 mt-3 flex-wrap">
                    {categoryNames.map((category) => (
                        <button
                            key={category} onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2 rounded-lg font-medium transition ${activeCategory === category
                                ? "bg-yellow-500 text-black"
                                : "bg-[#2a2a2a] text-white"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <hr className="border-[#2a2a2a] my-3" />

                {/* Products */}

                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
                    <div className="grid grid-cols-2 gap-5 px-10 pb-4">
                        {products.map((item) => {
                            const colours = [...new Set(item.variants.map(v => v.color)),];
                            const savedVariant = selectedVariant[item._id];
                            const selected =
                                item.variants.find(
                                    (v) =>
                                        v.size === savedVariant?.size &&
                                        (v.color || "") === (savedVariant?.color || "")
                                ) || item.variants[0]; const outOfStock = purchaseMode[item._id] !== "Tailoring" && selected.stock <= 0;
                            const selectedColour = selected.color || colours[0];
                            const availableSizes = item.variants.filter(v => v.color === selectedColour);
                            const key = `${item._id}-${selected.size}-${selected.color}`;
                            return (
                                <div key={item._id} className="bg-[#1a1a1a] rounded-lg p-5">
                                    <div className="flex justify-between">
                                        <h2 className="text-white text-lg font-bold">{item.name}</h2>
                                        <p className="text-gray-400 text-lg font-medium pt-0.5">{item.gender}</p>
                                        {
                                            purchaseMode[item._id] === "Tailoring" ? (
                                                <p className="text-blue-400 mt-2 font-medium">
                                                    Price at Billing
                                                </p>
                                            ) : (
                                                <p className="text-green-400 mt-2 font-medium">
                                                    ₹{item.sellingPrice}
                                                </p>
                                            )
                                        }
                                        {
                                            purchaseMode[item._id] !== "Tailoring" &&
                                                selected.stock === 0 ? (

                                                <button
                                                    onClick={() => {
                                                        setSelectedStockItem({
                                                            item,
                                                            variant: selected,
                                                            category: activeCategory,
                                                        });
                                                        setShowStockModal(true);
                                                    }}
                                                    className="bg-red-600 text-white px-3 py-2 rounded-lg font-semibold"
                                                >
                                                    Add Stock
                                                </button>

                                            ) : (

                                                <button
                                                    onClick={() => handleAddToCart(item, selected)}
                                                    className="bg-green-700 p-3 rounded-lg"
                                                >
                                                    <FaCartShopping />
                                                </button>

                                            )
                                        }
                                    </div>

                                    {/* Colour */}
                                    <div className="mt-2">
                                        <p className="text-gray-400 font-semibold mb-2">Colour</p>
                                        <span className="flex gap-2">
                                            {colours.map((colour) => (
                                                <button key={colour} onClick={() => {
                                                    const firstVariant = item.variants.find(v => v.color === colour);
                                                    setSelectedVariant({
                                                        ...selectedVariant, [item._id]: {
                                                            size: firstVariant.size,
                                                            color: firstVariant.color,
                                                        },
                                                    });
                                                }}
                                                    className={`px-3 py-1 rounded font-medium ${selectedColour === colour
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-[#333] text-white"
                                                        }`}
                                                >{colour}
                                                </button>
                                            ))}
                                        </span>
                                    </div>

                                    {
                                        purchaseMode[item._id] !== "Tailoring" && (
                                            <>
                                                {/* Size */}
                                                <div className="mt-5">
                                                    <p className="text-gray-400 font-semibold mb-2">Size</p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {availableSizes.map((variant) => (
                                                            <button
                                                                key={variant.size}
                                                                onClick={() =>
                                                                    setSelectedVariant({
                                                                        ...selectedVariant,
                                                                        [item._id]:
                                                                        {
                                                                            size: variant.size,
                                                                            color: variant.color,
                                                                        },
                                                                    })
                                                                }
                                                                className={`px-3 py-1 font-medium rounded ${selected.size === variant.size
                                                                    ? "bg-yellow-500 text-black"
                                                                    : "bg-[#333] text-white"
                                                                    }`}
                                                            >
                                                                {variant.size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }

                                    {
                                        purchaseMode[item._id] === "Tailoring" && (
                                            <div className="mt-5">
                                                <p className="text-blue-400 font-medium">
                                                    Measurements will be taken later.
                                                </p>
                                            </div>
                                        )
                                    }

                                    {/* Purchase Type */}

                                    <div className="mt-5">
                                        <p className="text-gray-400 font-semibold mb-2">
                                            Purchase Type
                                        </p>

                                        <div className="flex gap-3">

                                            <button
                                                onClick={() =>
                                                    setPurchaseMode({
                                                        ...purchaseMode,
                                                        [item._id]: "ReadyMade",
                                                    })
                                                }
                                                className={`px-4 py-2 rounded-lg font-medium transition ${(purchaseMode[item._id] || "ReadyMade") === "ReadyMade"
                                                    ? "bg-green-600 text-white"
                                                    : "bg-[#333] text-white"
                                                    }`}
                                            >
                                                Ready Made
                                            </button>

                                            {/* <button
                                            onClick={() =>
                                                setPurchaseMode({
                                                    ...purchaseMode,
                                                    [item._id]: "Tailoring",
                                                })
                                            }
                                            className={`px-4 py-2 rounded-lg font-medium transition ${purchaseMode[item._id] === "Tailoring"
                                                ? "bg-blue-600 text-white"
                                                : "bg-[#333] text-white"
                                                }`}
                                        >
                                            Custom Stitching
                                        </button> */}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between items-center font-light">
                                        {
                                            purchaseMode[item._id] === "Tailoring" ? (
                                                <p className="text-blue-400">
                                                    Tailoring Service
                                                </p>
                                            ) : outOfStock ? (
                                                <p className="text-red-500 font-semibold">
                                                    Out of Stock
                                                </p>
                                            ) : (
                                                <p className="text-green-400">
                                                    Stock : {selected.stock}
                                                </p>
                                            )
                                        }
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => decrement(key)}
                                                className="w-8 h-8 rounded bg-[#2b2b2b] text-white hover:bg-[#3a3a3a]"
                                            > -
                                            </button>

                                            <input
                                                type="number"
                                                min="0"
                                                max={
                                                    purchaseMode[item._id] === "Tailoring"
                                                        ? undefined
                                                        : selected.stock
                                                }
                                                value={itemCounts[key] || 0}
                                                onChange={(e) => {
                                                    let qty = Number(e.target.value);
                                                    if (qty < 0) qty = 0;
                                                    if (purchaseMode[item._id] !== "Tailoring" &&
                                                        qty > selected.stock
                                                    ) { qty = selected.stock; }
                                                    setItemCounts(prev => ({
                                                        ...prev,
                                                        [key]: qty,
                                                    }));

                                                }}
                                                className="w-16 bg-[#2b2b2b] text-center text-white rounded py-1 outline-none"
                                            />

                                            <button
                                                onClick={() =>
                                                    increment(
                                                        key,
                                                        selected.stock,
                                                        purchaseMode[item._id] === "Tailoring"
                                                            ? "Tailoring"
                                                            : "ReadyMade"
                                                    )
                                                }
                                                className="w-8 h-8 rounded bg-[#2b2b2b] text-white hover:bg-[#3a3a3a]"
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {showCreateOrderModal && (
                <CreateOrderModal
                    isOpen={true}
                    initialCustomer={initialCustomer}
                    customer={customerData}
                    navigateAfterCreate={navigateAfterCreate}
                    hasTailoringItems={hasTailoringItems}
                    onClose={() => {
                        setShowCreateOrderModal(false);
                        setPendingItem(null);
                    }}
                    onSuccess={() => {
                        if (pendingItem) {
                            addItemToCart(
                                pendingItem.item,
                                pendingItem.variant
                            );
                            setPendingItem(null);
                        }
                    }}
                />
            )}
            {
                showStockModal &&
                selectedStockItem && (

                    <ManualStockModal
                        initialProduct={selectedStockItem}
                        onClose={() => {
                            setShowStockModal(false);
                            setSelectedStockItem(null);
                        }}
                    />
                )
            }
        </>
    );
};

export default ProductContainer;