import { useState } from "react";
import { enqueueSnackbar } from "notistack";

const LedgerFilterModal = ({
    title,
    onClose,
    onSubmit,
}) => {

    const today = new Date().toISOString().split("T")[0];

    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);

    const handleSubmit = () => {

        if (!fromDate) {
            enqueueSnackbar(
                "Please select From Date",
                {
                    variant: "warning",
                }
            );
            return;
        }

        if (!toDate) {
            enqueueSnackbar(
                "Please select To Date",
                {
                    variant: "warning",
                }
            );
            return;
        }

        if (fromDate > toDate) {
            enqueueSnackbar(
                "From Date cannot be greater than To Date",
                {
                    variant: "error",
                }
            );
            return;
        }

        onSubmit(fromDate, toDate);
    };

    return (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="bg-[#262626] rounded-xl w-112.5 p-6">

                <h2 className="text-2xl font-bold text-white mb-6">
                    {title}
                </h2>

                <div className="space-y-5">

                    <div>

                        <label className="block text-gray-300 mb-2">
                            From Date
                        </label>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) =>
                                setFromDate(e.target.value)
                            }
                            className="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 outline-none"
                        />

                    </div>

                    <div className="text-white">

                        <label className="block text-gray-300 mb-2">
                            To Date
                        </label>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) =>
                                setToDate(e.target.value)
                            }
                            className="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 outline-none"
                        />

                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-8">

                    <button
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-5 py-2 rounded-lg"
                    >
                        Show
                    </button>

                </div>

            </div>

        </div>

    );
};

export default LedgerFilterModal;