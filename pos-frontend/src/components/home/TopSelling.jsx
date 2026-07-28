import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getOrders } from "../../https";

const TopSelling = () => {
    const { data } = useQuery({
        queryKey: ["products"],
        queryFn: getProducts,
    });
    const { data: orderRes } = useQuery({
        queryKey: ["orders"],
        queryFn: getOrders,
    });
    const categories = useMemo(() => data?.data?.products ?? [], [data]);
    const products = useMemo(() => {
    const rows = [];

    categories.forEach((category) => {
        category.items.forEach((item) => {
            item.variants.forEach((variant) => {
                rows.push({
                    id: `${item._id}-${variant.size}-${variant.color}`,
                    itemId: item._id,
                    name: item.name,
                    school: item.school,
                    category: category.category,
                    size: variant.size,
                    color: variant.color,
                    stock: variant.stock,
                });
            });
        });
    });

    return rows;
}, [categories]);

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    
    const soldMap = {};
    (orderRes?.data?.data || []).forEach((order) => {
        const orderDate = new Date(order.orderDate);
        if (orderDate < startOfWeek) return;
        order.items.forEach((item) => {
            const key = `${item.itemId}-${item.size}-${item.color}`;

soldMap[key] = (soldMap[key] || 0) + item.quantity;
        });
    });
    const topSelling = products
    .map(product => ({
        ...product,
        sold:
            soldMap[
                `${product.itemId}-${product.size}-${product.color}`
            ] || 0,
    }))
    .filter(product => product.sold > 0)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 10);

    return (
        <div className="mt-6 pr-6">
            <div className="bg-[#1a1a1a] w-full rounded-lg">
                <div className="flex justify-between items-center px-6 py-4">
                    <h1 className="text-[#f5f5f5] text-lg font-semibold tracking wide">Top Selling This Week</h1>
                    <span className="text-gray-400 text-sm font-medium">{topSelling.length} Products</span>
                </div>
                <div className="overflow-y-scroll h-126 pb-5 scrollbar-none">
                    {
                        topSelling.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-5 bg-[#1f1f1f] rounded-xl px-5 py-4 mx-6 mb-3"
                            >
                                <div className="bg-red-900 text-red-300 rounded-full w-10 h-10 flex items-center justify-center font-bold">{index + 1}</div>
                                <div className="flex-1">
                                    <h1 className="text-white font-semibold">{item.name}</h1>
                                    <p className="text-gray-400 text-sm">{item.school}</p>
                                    <p className="text-gray-500 text-xs">Size: {item.size} • {item.color}</p>
                                    <p className="text-gray-500 text-xs"> Sold this week : {item.sold}</p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm ${item.stock === 0
                                            ? "bg-red-900 text-red-300"
                                            : item.stock <= 5
                                                ? "bg-yellow-900 text-yellow-300"
                                                : "bg-green-900 text-green-300"
                                        }`}
                                >
                                    Stock : {item.stock}
                                </span>                            
                                </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default TopSelling
