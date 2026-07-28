import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStockHistory } from "../../https";

const StockHistoryTable = () => {

    const { data, isLoading } = useQuery({
        queryKey: ["stock-history"],
        queryFn: getStockHistory,
    });

    const history = useMemo(
        () => data?.data?.history ?? [],
        [data]
    );
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("All");
    const filteredHistory = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? 6 : day - 1;
        startOfWeek.setDate(startOfWeek.getDate() - diff);
        const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        return history.filter((row) => {
            const term = search.toLowerCase();
            const matchesSearch =
                row.productName?.toLowerCase().includes(term) ||
                row.school?.toLowerCase().includes(term) ||
                row.size?.toLowerCase().includes(term) ||
                row.colour?.toLowerCase().includes(term);
            const rowDate = new Date(row.createdAt);
            let matchesDate = true;
            if (dateFilter === "Today") {
                matchesDate = rowDate >= today;
            } else if (dateFilter === "This Week") {
                matchesDate = rowDate >= startOfWeek;
            } else if (dateFilter === "This Month") {
                matchesDate = rowDate >= startOfMonth;
            }
            return matchesSearch && matchesDate;
        });

    }, [history, search, dateFilter]);
    if (isLoading) {
        return (
            <div className="text-white p-10">
                Loading...
            </div>
        );
    }

    return (
        <div className="bg-[#1a1a1a] rounded-xl h-115 overflow-y-scroll scrollbar-none">
            <div className="flex justify-between items-center p-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product, school, size or colour"
                    className="bg-[#202020] text-white rounded-lg px-5 py-3 w-96 outline-none"
                />
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-[#202020] text-white rounded-lg px-4 py-3"
                >
                    <option>All</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                </select>
            </div>
            <table className="w-full">
                <thead className="bg-[#202020] sticky top-0">
                    <tr>
                        <th className="p-4 text-left text-gray-300">Date</th>
                        <th className="p-4 text-left text-gray-300">School</th>
                        <th className="p-4 text-left text-gray-300">Product</th>
                        <th className="p-4 text-left text-gray-300">Size</th>
                        <th className="p-4 text-left text-gray-300">Colour</th>
                        <th className="p-4 text-left text-gray-300">Operation</th>
                        <th className="p-4 text-left text-gray-300">Previous</th>
                        <th className="p-4 text-left text-gray-300">Quantity</th>
                        <th className="p-4 text-left text-gray-300">New</th>
                    </tr>
                </thead>
                <tbody>
                   {filteredHistory.map((row) => (
                        <tr
                            key={row._id}
                            className="border-b border-[#2d2d2d]"
                        >
                            <td className="p-4 text-gray-400 font-medium">
                                {new Date(
                                    row.createdAt
                                ).toLocaleString()}
                            </td>
                            <td className="p-4 text-white"> {row.productName} </td>
                            <td className="p-4 text-white"> {row.school} </td>
                            <td className="p-4 text-white"> {row.size} </td>
                            <td className="p-4 text-white"> {row.colour} </td>
                            <td className="p-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${row.operation === "add"
                                        ? "bg-green-900 text-green-300"
                                        : "bg-blue-900 text-blue-300"
                                        }`}
                                >
                                    {row.operation === "add"
                                        ? "Receive"
                                        : "Set"}
                                </span>
                            </td>
                            <td className="p-4 text-white"> {row.previousStock} </td>
                            <td className="p-4 text-green-400"> {row.quantity} </td>
                            <td className="p-4 text-yellow-400"> {row.newStock} </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockHistoryTable;