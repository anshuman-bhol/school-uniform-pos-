import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BackButton from "../components/shared/BackButton";
import { getUsers } from "../https";
import UserCard from "../components/admin/UserCard";

const tabs = [
    "Pending",
    "Approved",
    "Rejected",
];

const statusMap = {
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
};

const UserApprovals = () => {

    const [activeTab, setActiveTab] = useState("Pending");
    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["users", activeTab],
        queryFn: async () => {
            const response = await getUsers(
                statusMap[activeTab]
            );

            return response.data.data;
        },
    });

    return (

        <div className="bg-[#252323] h-[calc(100vh-80px)]">
            <div className="container mx-auto py-8 px-4">
                {/* Header */}

                <div className="flex items-center justify-between">
                    <BackButton />
                    <h1 className="text-3xl font-bold text-white">
                        User Approvals
                    </h1>
                    <div />
                </div>

                {/* Tabs */}

                <div className="flex items-center gap-3 mt-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-lg font-semibold transition ${activeTab === tab
                                ? "bg-[#262626] text-white"
                                : "bg-[#1a1a1a] hover:bg-[#262626] text-[#f5f5f5]"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Users */}

                <div className="mt-8 text-white  h-[calc(72vh-80px)] overflow-y-scroll scrollbar-none">
                    {isLoading && (
                        <div className="text-white">
                            Loading users...
                        </div>
                    )}

                    {isError && (
                        <div className="text-red-500">
                            Failed to load users
                        </div>
                    )}

                    {!isLoading &&
                        !isError &&
                        data?.length === 0 && (
                            <div className="text-gray-400 text-center text-2xl font-medium">
                                No users found
                            </div>
                        )}

                    {!isLoading &&
                        !isError &&
                        data?.map((user) => (
                            <UserCard
                                key={user._id}
                                user={user}
                                activeTab={activeTab}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default UserApprovals;