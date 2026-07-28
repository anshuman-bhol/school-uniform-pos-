import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { updateOrderStatus } from "../../https";

const TailoringStatusSelect = ({
    order,
    tailoringStatus,
    getStatusColor,
    onStatusChange,

}) => {

    const queryClient = useQueryClient();

    const orderStatusMutation = useMutation({
        mutationFn: ({ tailoringStatus, tailor }) =>
            updateOrderStatus({
                orderId: order._id,
                tailoringStatus,
                tailor,
            }),

        onSuccess: () => {
            enqueueSnackbar(
                "Order updated successfully",
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
        },

        onError: (error) => {
            enqueueSnackbar(
                error?.response?.data?.message ||
                "Unable to update order",
                {
                    variant: "error",
                }
            );
        },
    });

    return (
        <select
            value={tailoringStatus}
            onChange={(e) => {

                if (onStatusChange) {

                    onStatusChange(e.target.value);

                } else {

                    orderStatusMutation.mutate({
                        tailoringStatus: e.target.value,
                    });

                }
            }}
            className={`rounded-lg border px-3 py-2 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${getStatusColor(
                tailoringStatus
            )}`}
        >

            {/* Order Placed */}
            {tailoringStatus === "Order Placed" && (
                <>
                    <option className="bg-[#262626]" value="Order Placed">
                        Order Placed
                    </option>

                    <option className="bg-[#262626]" value="Tailor Assigned">
                        Assign Tailor
                    </option>

                    <option className="bg-[#262626]" value="Delivered">
                        Delivered
                    </option>
                </>
            )}

            {/* Tailor Assigned */}
            {tailoringStatus === "Tailor Assigned" && (
                <>
                    <option className="bg-[#262626]" value="Tailor Assigned">
                        Tailor Assigned
                    </option>

                    <option className="bg-[#262626]" value="Stitching">
                        Stitching
                    </option>

                    <option className="bg-[#262626]" value="Delivered">
                        Delivered
                    </option>
                </>
            )}

            {/* Stitching */}
            {tailoringStatus === "Stitching" && (
                <>
                    <option className="bg-[#262626]" value="Stitching">
                        Stitching
                    </option>

                    <option className="bg-[#262626]" value="Ready">
                        Ready
                    </option>

                    <option className="bg-[#262626]" value="Delivered">
                        Delivered
                    </option>
                </>
            )}

            {/* Ready */}
            {tailoringStatus === "Ready" && (
                <>
                    <option className="bg-[#262626]" value="Ready">
                        Ready
                    </option>

                    <option className="bg-[#262626]" value="Delivered">
                        Delivered
                    </option>
                </>
            )}

            {/* Delivered */}
            {tailoringStatus === "Delivered" && (
                <>
                    <option className="bg-[#262626]" value="Delivered">
                        Delivered
                    </option>

                    <option className="bg-[#262626]" value="Order Placed">
                        Reassign Tailor
                    </option>
                </>
            )}
        </select>
    )
}

export default TailoringStatusSelect
