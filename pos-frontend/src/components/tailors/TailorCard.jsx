import { getAvatarName, getBgColor } from "../../utils";
import { FaEllipsisV } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { enqueueSnackbar } from "notistack";

const TailorCard = ({ tailor, onSelect, onToggleStatus, onEdit, hasPendingOrder }) => {
    const {
        name,
        phone,
        specialization,
        status,
        currentOrders,
    } = tailor;

    const orderCount = currentOrders?.length || 0;
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    const badgeColor =
        status === "Available"
            ? "bg-green-900 text-green-300"
            : status === "Busy"
                ? "bg-yellow-900 text-yellow-300"
                : "bg-red-900 text-red-300";
    return (
        <div
            onClick={() => {
                if (status !== "Inactive") {
                    onSelect?.(tailor);
                }
            }}
            className={`w-85 h-80 rounded-xl p-5 shadow-lg transition
                ${status !== "Inactive" && hasPendingOrder
                    ? "bg-[#262626] cursor-pointer"
                    : "bg-[#262626] cursor-default"
                }
                ${status === "Inactive" ? " opacity-50" : ""}
                `}
        >
            <div className="flex justify-between items-start">

                <div>
                    <h2 className="text-xl font-semibold text-white">{name}</h2>
                    <span className={`mt-2 inline-block px-3 py-1 rounded-lg text-sm ${badgeColor}`}>{status}</span>
                </div>
                <div ref={menuRef} className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="text-gray-400 hover:text-white"
                    >
                        <FaEllipsisV />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-44 rounded-lg bg-[#1f1f1f] shadow-lg border border-[#3b3b3b] z-50">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    if (status === "Busy") {
                                        enqueueSnackbar(
                                            "Cannot edit a busy tailor.",
                                            { variant: "warning" }
                                        );
                                        return;
                                    }

                                    onEdit?.(tailor);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[#333] text-white"
                            >
                                Edit Tailor
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onToggleStatus?.(tailor);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[#333] text-white"
                            >
                                {status === "Inactive"
                                    ? "Mark Active"
                                    : "Mark Inactive"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-center my-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl text-white"
                    style={{ backgroundColor: getBgColor(), }}>
                    {getAvatarName(name)}
                </div>
            </div>
            <div className="space-y-2 text-white">
                <p>Phone: {phone || "-"}</p>
                <p>Specialization: {specialization || "-"}</p>
                <p>Active Orders:<span className="font-semibold ml-2">{orderCount}</span></p>
                {status === "Inactive" && (
                    <p className="mt-4 text-center text-red-400 text-sm font-semibold">
                        Tailor is currently unavailable
                    </p>
                )}
                {
                    status !== "Inactive" && hasPendingOrder && (
                        <p className="text-green-400 text-sm mt-3">
                            Click to assign order
                        </p>
                    )
                }
            </div>
        </div>
    );
};

export default TailorCard;