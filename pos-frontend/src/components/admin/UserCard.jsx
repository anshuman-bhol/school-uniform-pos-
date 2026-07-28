import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveUser } from "../../https";
import { enqueueSnackbar } from "notistack";
import RejectModal from "./RejectModal";
import { rejectUser } from "../../https";

const roles = [
    "admin",
    "cashier",
    "employee",
];

const UserCard = ({ user, activeTab }) => {

    const [selectedRole, setSelectedRole] = useState("");
    const queryClient = useQueryClient();
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const approveMutation = useMutation({

        mutationFn: approveUser,

        onSuccess: (res) => {

            enqueueSnackbar(res.data.message, {
                variant: "success",
            });

            queryClient.invalidateQueries({
                queryKey: ["users"],
            });

        },

        onError: (error) => {

            enqueueSnackbar(
                error.response?.data?.message ||
                "Failed to approve user",
                {
                    variant: "error",
                }
            );

        },

    });

    const rejectMutation = useMutation({

        mutationFn: rejectUser,

        onSuccess: (res) => {

            enqueueSnackbar(res.data.message, {
                variant: "success",
            });

            setIsRejectModalOpen(false);

            queryClient.invalidateQueries({
                queryKey: ["users"],
            });

        },

        onError: (error) => {

            enqueueSnackbar(
                error.response?.data?.message ||
                "Failed to reject user",
                {
                    variant: "error",
                }
            );

        },

    });

    return (
        <div className="bg-[#1a1a1a] rounded-lg p-5 mb-4">

            <h2 className="text-white text-lg font-semibold">
                {user.name}
            </h2>

            <p className="text-gray-400 font-medium mt-2">
                {user.email}
            </p>

            <p className="text-gray-400 font-medium">
                {user.phone}
            </p>

            <div className="mt-4">
                <span className="text-sm text-gray-400 font-semibold">
                    Status :
                </span>

                <span
                    className={`ml-2 font-semibold ${user.status === "approved"
                        ? "text-green-400"
                        : user.status === "rejected"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                >
                    {user.status}
                </span>
            </div>

            {activeTab === "Pending" && (
                <div className="mt-5">
                    <p className="text-gray-300 mb-3 font-medium">
                        Assign Role
                    </p>

                    <div className="flex gap-3 flex-wrap">
                        {roles.map((role) => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${selectedRole === role
                                    ? "bg-[#f6b100] text-black"
                                    : "bg-[#2d2d2d] hover:bg-[#3a3a3a] text-white"
                                    }`}
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>

                        ))}

                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            disabled={!selectedRole || approveMutation.isPending}
                            onClick={() =>
                                approveMutation.mutate({
                                    userId: user._id,
                                    role: selectedRole,
                                })
                            }
                            className={`px-5 py-2 rounded-lg font-semibold transition ${selectedRole
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            {approveMutation.isPending ? "Approving..." : "Approve"}
                        </button>

                        <button
                            onClick={() => setIsRejectModalOpen(true)}
                            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg text-white font-semibold"
                        >
                            Reject
                        </button>

                    </div>

                </div>
            )}

            {activeTab === "Approved" && (
                <div className="mt-5 text-gray-300">

                    <p>
                        <span className="font-semibold">
                            Role :
                        </span>{" "}
                        {user.role}
                    </p>

                    <p className="mt-2">
                        <span className="font-semibold">
                            Approved By :
                        </span>{" "}
                        {user.approvedBy?.name || "-"}
                    </p>

                </div>
            )}

            {activeTab === "Rejected" && (
                <div className="mt-5 text-gray-300">

                    <p className="font-semibold">
                        Rejection Reason
                    </p>

                    <p className="text-red-400 mt-2">
                        {user.rejectionReason || "-"}
                    </p>

                </div>
            )}

            <RejectModal
                isOpen={isRejectModalOpen}
                isLoading={rejectMutation.isPending}
                onClose={() => setIsRejectModalOpen(false)}
                onReject={(reason) =>
                    rejectMutation.mutate({
                        userId: user._id,
                        rejectionReason: reason,
                    })
                }
            />

        </div>
    );
};

export default UserCard;