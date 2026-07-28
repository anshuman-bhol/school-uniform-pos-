import { motion } from "framer-motion";
import { IoMdCloseCircle } from "react-icons/io";
import { useQuery, useMutation, useQueryClient, } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getTailors, updateOrderStatus, changeOrderTailor } from "../../https";

const AssignTailorModal = ({ onClose, order }) => {
    const queryClient = useQueryClient();
    const { data } = useQuery({
        queryKey: ["tailors"],
        queryFn: getTailors,
        placeholderData: keepPreviousData,
    });
    const tailors = data?.data?.data || [];
    const availableTailors = tailors.filter((tailor) => tailor.status !== "Inactive");
    const assignTailorMutation = useMutation({
        mutationFn: ({ tailorId }) => {

            // Existing tailor -> change tailor
            if (order.tailor) {
                return changeOrderTailor({
                    orderId: order._id,
                    tailorId,
                });
            }

            // First assignment
            return updateOrderStatus({
                orderId: order._id,
                tailoringStatus: order.nextStatus,
                tailor: tailorId,
            });
        },

        onSuccess: () => {
            enqueueSnackbar(
                order.tailor
                    ? "Tailor changed successfully."
                    : "Tailor assigned successfully.",
                {
                    variant: "success",
                }
            );

            queryClient.invalidateQueries({
                queryKey: ["orders"],
            });
            queryClient.invalidateQueries({
                queryKey: ["tailors"],
            });
            onClose();
        },

        onError: (error) => {
            enqueueSnackbar(
                error?.response?.data?.message ||
                "Unable to assign tailor.",
                {
                    variant: "error",
                }
            );
        },
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#262626] rounded-xl w-173.5 p-6"
            >

                <div className="flex justify-between items-center mb-5">

                    <h2 className="text-xl text-white font-bold">
                        Assign Tailor
                    </h2>

                    <button onClick={onClose}>
                        <IoMdCloseCircle
                            size={28}
                            className="text-white hover:text-red-500"
                        />
                    </button>

                </div>
                <div className="space-y-3 max-h-100 overflow-y-auto">
                    {availableTailors.map((tailor) => (
                        <button
                            key={tailor._id}
                            onClick={() =>
                                assignTailorMutation.mutate({
                                    tailorId: tailor._id,
                                })
                            }
                            className="w-full bg-[#1f1f1f] hover:bg-[#343434] rounded-lg p-4 flex justify-between items-center"
                        >
                            <div className="text-left">
                                <p className="text-white font-semibold">
                                    {tailor.name}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {tailor.specialization}
                                </p>
                            </div>
                            <span className="text-green-400">
                                Available
                            </span>
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
export default AssignTailorModal;