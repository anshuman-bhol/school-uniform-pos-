import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../https";
import { useMemo, useState } from "react";
import SummaryCard from "./SummaryCard";

const InventoryTable = () => {

    const { data } = useQuery({
        queryKey: ["products"],
        queryFn: getProducts,
    });

    const categories = useMemo(
        () => data?.data?.products ?? [],
        [data]
    );

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const rows = useMemo(() => {
        const temp = [];
        categories.forEach(category => {
            category.items.forEach(item => {
                item.variants.forEach((variant, index) => {
                    temp.push({
                        _id: `${item._id}-${index}`,
                        category: category.category,
                        name: item.name,
                        sellingPrice: item.sellingPrice,
                        school: item.school,
                        gender: item.gender,
                        size: variant.size,
                        color: variant.color,
                        stock: variant.stock,
                    });
                });
            });
        });
        return temp
            .filter((item) => {
                const matchCategory =
                    categoryFilter === "All"
                        ? true
                        : item.category === categoryFilter;

                const matchSearch =
                    item.name.toLowerCase().includes(search.toLowerCase());

                return matchCategory && matchSearch;
            })
            .sort((a, b) => {
                // Out of Stock first
                if (a.stock === 0 && b.stock !== 0) return -1;
                if (a.stock !== 0 && b.stock === 0) return 1;

                // Low Stock next
                const aLow = a.stock > 0 && a.stock <= 5;
                const bLow = b.stock > 0 && b.stock <= 5;

                if (aLow && !bLow) return -1;
                if (!aLow && bLow) return 1;

                // Remaining products by stock (highest first)
                return b.stock - a.stock;
            });

    }, [categories, search, categoryFilter]);

    const totalProducts = rows.length;
    const available = rows.filter(p => p.stock > 5).length;
    const lowStock = rows.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outStock = rows.filter(p => p.stock === 0).length;
    return (
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden text-center flex flex-col h-full">

            <div className="grid grid-cols-4 gap-4 mb-6 font-medium shrink-0">
                <SummaryCard title="Products" value={totalProducts} />
                <SummaryCard title="Available" value={available} />
                <SummaryCard title="Low Stock" value={lowStock} />
                <SummaryCard title="Out of Stock" value={outStock} />
            </div>

            <div className="flex justify-between items-center mb-5 px-10 shrink-0">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Product"
                    className="bg-[#202020] text-white rounded-lg px-5 py-3 w-96 max-w-full outline-none"
                />

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#202020] text-white rounded-lg px-4 py-3"
                >
                    <option>All</option>

                    {categories.map((cat) => (
                        <option key={cat.category}>
                            {cat.category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Scrollable Table */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-2 pb-4">

                <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-[#202020]">
                        <tr className="text-center">
                            <th className="p-4 text-gray-300">Category</th>
                            <th className="p-4 text-gray-300">Product</th>
                            <th className="p-4 text-gray-300">School</th>
                            <th className="p-4 text-gray-300">Size</th>
                            <th className="p-4 text-gray-300">Color</th>
                            <th className="p-4 text-gray-300">Stock</th>
                            <th className="p-4 text-gray-300">Price</th>
                            <th className="p-4 text-gray-300">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((item) => (
                                <tr
                                    key={item._id}
                                    className={`border-b border-[#2b2b2b] font-light text-center hover:bg-[#232323]
                                ${item.stock === 0
                                            ? "bg-red-950/30"
                                            : item.stock <= 5
                                                ? "bg-yellow-950/20"
                                                : ""
                                        }`}
                                >
                                    <td className="p-4 text-white">
                                        {item.category}
                                    </td>
                                    <td className="p-4 text-white">
                                        {item.name}
                                    </td>
                                    <td className="p-4 text-white">
                                        {item.school}
                                    </td>
                                    <td className="p-4 text-white">
                                        {item.size}
                                    </td>
                                    <td className="p-4 text-white">
                                        {item.color}
                                    </td>
                                    <td
                                        className={`p-4 font-semibold ${item.stock === 0
                                            ? "text-red-400"
                                            : item.stock <= 5
                                                ? "text-yellow-400"
                                                : "text-green-400"
                                            }`}
                                    >
                                        {item.stock}
                                    </td>
                                    <td className="p-4 text-green-400 font-semibold">
                                        ₹{item.sellingPrice || 0}
                                    </td>
                                    <td className="p-4">
                                        {item.stock === 0 ? (
                                            <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm">
                                                Out of Stock
                                            </span>
                                        ) : item.stock <= 5 ? (
                                            <span className="bg-yellow-900 text-yellow-300 px-3 py-1 rounded-full text-sm">
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm">
                                                Available
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="h-16 border-b border-[#2b2b2b] font-light text-center hover:bg-[#232323]">
                                <td
                                    colSpan={8}
                                    className="h-72 text-center text-gray-400 text-lg"
                                >
                                    No Products Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>

        </div>
    );
};

export default InventoryTable;