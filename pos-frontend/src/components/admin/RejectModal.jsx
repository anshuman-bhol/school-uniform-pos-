import { useState } from "react";

const RejectModal = ({
    isOpen,
    onClose,
    onReject,
    isLoading,
}) => {

    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    const handleReject = () => {

        onReject(reason);

        setReason("");

    };

    return (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="bg-[#1f1f1f] rounded-xl p-6 w-125">

                <h2 className="text-white text-2xl font-bold">
                    Reject Registration
                </h2>

                <p className="text-gray-400 mt-2">
                    Please provide a reason.
                </p>

                <textarea
                    value={reason}
                    onChange={(e) =>
                        setReason(e.target.value)
                    }
                    rows={5}
                    className="w-full mt-5 rounded-lg bg-[#2d2d2d] text-white p-3 outline-none resize-none"
                    placeholder="Enter rejection reason..."
                />

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={() => {

                            setReason("");

                            onClose();

                        }}
                        className="px-5 py-2 rounded-lg bg-gray-600 text-white"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={
                            !reason.trim() ||
                            isLoading
                        }
                        onClick={handleReject}
                        className={`px-5 py-2 rounded-lg font-semibold ${
                            reason.trim()
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-gray-600 text-gray-400"
                        }`}
                    >
                        {isLoading
                            ? "Rejecting..."
                            : "Reject"}
                    </button>

                </div>

            </div>

        </div>

    );

};

export default RejectModal;