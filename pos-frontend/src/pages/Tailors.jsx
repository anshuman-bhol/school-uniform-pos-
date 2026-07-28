import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TailorCard from "../components/tailors/TailorCard";
import TailorModal from "../components/dashboard/TailorModal";
import TailorOrdersModal from "../components/tailors/TailorOrdersModal";
import Invoice from "../components/invoice/Invoice";
import { getTailors, updateTailor, addOrder } from "../https";
import { enqueueSnackbar } from "notistack";
import { removeAllItems } from "../redux/slices/cartSlice";
import { removeCustomer } from "../redux/slices/customerSlice";
import { clearPendingOrder } from "../redux/slices/pendingOrderSlice";

const Tailors = () => {
    const [status, setStatus] = useState("all");
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const pendingOrder = useSelector((state) => state.pendingOrder.orderData);
    const [selectedTailorId, setSelectedTailorId] = useState(null);
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const [editingTailor, setEditingTailor] = useState(null);
    const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
    const { data: resData, isError } = useQuery({
        queryKey: ["tailors"],
        queryFn: getTailors,
        placeholderData: keepPreviousData,
    });

    const orderMutation = useMutation({
        mutationFn: addOrder,
        onSuccess: async (response) => {
            const order = response.data.data;
            setOrderInfo(order);
            dispatch(removeCustomer());
            dispatch(removeAllItems());
            dispatch(clearPendingOrder());
            enqueueSnackbar(
                "Order Placed Successfully",
                {
                    variant: "success",
                }
            );

            setShowInvoice(true);
            await queryClient.invalidateQueries({
                queryKey: ["tailors"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["orders"],
            });
        },
        onError: (error) => {
            enqueueSnackbar(
                error?.response?.data?.message ||
                "Unable to place order",
                {
                    variant: "error",
                }
            );
        },
    });
    const toggleTailorStatusMutation = useMutation({
        mutationFn: ({ tailorId, status }) =>
            updateTailor({ tailorId, status, }),
        onSuccess: () => {
            enqueueSnackbar(
                "Tailor status updated successfully.",
                {
                    variant: "success",
                }
            );

            queryClient.invalidateQueries({
                queryKey: ["tailors"],
            });
        },

        onError: (error) => {
            enqueueSnackbar(
                error?.response?.data?.message ||
                "Unable to update tailor status.",
                {
                    variant: "error",
                }
            );
        },
    });

    const tailors = resData?.data?.data || [];
    const selectedTailor = tailors.find(
        (tailor) => tailor._id === selectedTailorId
    );
    console.log(tailors);

    const filteredTailors = tailors.filter((tailor) => {
        if (status === "all") return true;
        if (status === "available") {
            return tailor.status === "Available";
        }
        if (status === "busy") {
            return tailor.status === "Busy";
        }
        if (status === "inactive") {
            return tailor.status === "Inactive";
        }
        return true;
    });
    const handleTailorSelect = (tailor) => {

        // No pending order → View tailor's orders
        if (!pendingOrder) {
            setSelectedTailorId(tailor._id);
            setShowOrdersModal(true);
            return;
        }

        // Existing assignment logic
        if (tailor.status === "Inactive") {
            enqueueSnackbar("Tailor is not available", {
                variant: "warning",
            });
            return;
        }

        const orderData = {
            ...pendingOrder,
            tailor: tailor._id,
            tailorDetails: {
                name: tailor.name,
                phone: tailor.phone,
            },
            orderStatus: {
                ...pendingOrder.orderStatus,
                tailoring: pendingOrder.orderStatus?.tailoring
                    ? {
                        ...pendingOrder.orderStatus.tailoring,
                        status: "Tailor Assigned",
                    }
                    : null,
            },
        };

        orderMutation.mutate(orderData);
    };
    const handleEditTailor = (tailor) => {
        setEditingTailor(tailor);
        setIsTailorModalOpen(true);
    };
    const handleToggleStatus = (tailor) => {
        if (
            tailor.status === "Busy" &&
            tailor.currentOrders.length > 0
        ) {
            enqueueSnackbar(
                "Cannot mark a busy tailor inactive.",
                {
                    variant: "warning",
                }
            );
            return;
        }
        const newStatus =
            tailor.status === "Inactive"
                ? "Available"
                : "Inactive";

        toggleTailorStatusMutation.mutate({
            tailorId: tailor._id,
            status: newStatus,
        });
    };
    if (isError) {
        enqueueSnackbar(
            "Something went wrong",
            { variant: "error" }
        );
    }
    return (
        <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
            <div className="flex items-center justify-between px-10 py-4">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <h1 className="text-[#f5f5f5] text-xl font-bold tracking-wide">
                        Tailors
                    </h1>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setStatus("all")}
                        className={`rounded-lg px-4 py-2 font-semibold ${status === "all"
                            ? "bg-[#383838] text-white"
                            : "text-[#ababab]"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatus("available")}
                        className={`rounded-lg px-4 py-2 font-semibold ${status === "available"
                            ? "bg-[#383838] text-white"
                            : "text-[#ababab]"
                            }`}
                    >
                        Available
                    </button>
                    <button
                        onClick={() => setStatus("busy")}
                        className={`rounded-lg px-4 py-2 font-semibold ${status === "busy"
                            ? "bg-[#383838] text-white"
                            : "text-[#ababab]"
                            }`}
                    >
                        Busy
                    </button>
                    <button
                        onClick={() => setStatus("inactive")}
                        className={`rounded-lg px-4 py-2 font-semibold ${status === "inactive"
                            ? "bg-[#383838] text-white"
                            : "text-[#ababab]"
                            }`}
                    >
                        Inactive
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-6 h-[75vh] justify-center overflow-y-auto scrollbar-none px-10 py-4">
                {filteredTailors.length > 0 ? (
                    filteredTailors.map((tailor) => (
                        <TailorCard
                            key={tailor._id}
                            tailor={tailor}
                            onSelect={handleTailorSelect}
                            onEdit={handleEditTailor}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No Tailors Available</p>
                )}
            </div>
            <BottomNav />
            {showOrdersModal && selectedTailor && (
                <TailorOrdersModal
                    tailor={selectedTailor}
                    onClose={() => {
                        setShowOrdersModal(false);
                        setSelectedTailorId(null);
                    }}
                />
            )}
            {isTailorModalOpen && (
                <TailorModal
                    tailor={editingTailor}
                    setIsTailorModalOpen={setIsTailorModalOpen}
                    hasPendingOrder={!!pendingOrder}
                />
            )}
            {showInvoice && (
                <Invoice
                    orderInfo={orderInfo}
                    setShowInvoice={setShowInvoice}
                />
            )}
        </section>
    );
};

export default Tailors;