import { useState } from "react";
import InventoryTable from "../components/inventory/InventoryTable";
import StockHistoryTable from "../components/inventory/StockHistoryTable";

const tabs = [
    "Products",
    "Stock History",
];

const Inventory = () => {

    const [activeTab, setActiveTab] = useState("Products");

    return (
        <div className="h-full flex flex-col px-6">
            <div className="flex gap-4 mb-6 mt-2 shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() =>
                            setActiveTab(tab)
                        }
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === tab
                                ? "bg-[#303030] text-white"
                                : "bg-[#1a1a1a] text-gray-400"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="flex-1 min-h-0">
                {activeTab === "Products" ? (
                    <InventoryTable />
                ) : (
                    <StockHistoryTable />
                )}
            </div>
        </div>
    );
};

export default Inventory;