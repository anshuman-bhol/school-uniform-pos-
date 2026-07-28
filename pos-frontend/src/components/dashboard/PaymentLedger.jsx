import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPaymentLedger } from "../../https";
import LedgerFilterModal from "./LedgerFilterModal";
import LedgerSummaryModal from "./LedgerSummaryModal";
import LedgerDetailsModal from "./LedgerDetailsModal";

const PaymentLedger = () => {

    const {
        data = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["payment-ledger"],
        queryFn: async () => {
            const response = await getPaymentLedger();
            return response.data.data;
        },
    });

    const [mode, setMode] = useState("");

    const [showFilterModal, setShowFilterModal] = useState(false);

    const [showSummaryModal, setShowSummaryModal] = useState(false);

    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [filteredTransactions, setFilteredTransactions] = useState([]);

    const [fromDate, setFromDate] = useState("");

    const [toDate, setToDate] = useState("");

    if (isLoading) {
        return (
            <div className="text-white p-6">
                Loading...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-red-500 p-6">
                Failed to load ledger.
            </div>
        );
    }

    const handleFilterSubmit = (from, to) => {

        setFromDate(from);

        setToDate(to);

        const allTransactions = data.flatMap(
            (day) => day.transactions
        );

        const filtered = allTransactions.filter(
            (transaction) => {

                const date =
                    transaction.time.split("T")[0];

                return (
                    date >= from &&
                    date <= to
                );

            }
        );

        setFilteredTransactions(filtered);

        setShowFilterModal(false);

        if (mode === "summary") {

            setShowSummaryModal(true);

        } else {

            setShowDetailsModal(true);

        }

    };

    return (

        <div className="h-full flex items-center justify-center">

            <div className="bg-[#1a1a1a] rounded-xl p-10 w-137.5">

                <h1 className="text-3xl font-bold text-white text-center">
                    Payment Ledger
                </h1>

                <p className="text-gray-400 text-center font-medium mt-2">
                    View payment summaries and transaction history
                </p>

                <div className="mt-10 flex flex-col gap-5">
                    <button
                        onClick={() => {
                            setMode("summary");
                            setShowFilterModal(true);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 transition text-black font-bold py-4 rounded-lg"
                    >Show Summary
                    </button>

                    <button
                        onClick={() => {
                            setMode("details");
                            setShowFilterModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 transition text-white font-bold py-4 rounded-lg"
                    >
                        Show Details
                    </button>
                </div>
            </div>
            {
                showFilterModal && (
                    <LedgerFilterModal
                        title={
                            mode === "summary"
                                ? "Show Summary"
                                : "Show Details"
                        }
                        onClose={() =>
                            setShowFilterModal(false)
                        }
                        onSubmit={handleFilterSubmit}
                    />
                )
            }
            {
                showSummaryModal && (
                    <LedgerSummaryModal
                        transactions={filteredTransactions}
                        fromDate={fromDate}
                        toDate={toDate}
                        onClose={() =>
                            setShowSummaryModal(false)
                        }
                    />
                )
            }
            {
                showDetailsModal && (
                    <LedgerDetailsModal
                        transactions={filteredTransactions}
                        fromDate={fromDate}
                        toDate={toDate}
                        onClose={() =>
                            setShowDetailsModal(false)
                        }
                    />
                )
            }
        </div>

    );

};

export default PaymentLedger;