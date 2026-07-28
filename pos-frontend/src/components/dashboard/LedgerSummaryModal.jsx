import { FaWallet } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";
import { FaMobileAlt } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";

const LedgerSummaryModal = ({
    transactions,
    fromDate,
    toDate,
    onClose,
}) => {

    const summary = transactions.reduce(
        (acc, transaction) => {

            acc.cash += Number(transaction.cash);

            acc.upi += Number(transaction.upi);

            acc.total += Number(transaction.total);

            return acc;

        },
        {
            cash: 0,
            upi: 0,
            total: 0,
        }
    );

    return (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="bg-[#262626] rounded-xl w-175 p-6">

                <h2 className="text-2xl font-bold text-white mb-2">
                    Payment Summary
                </h2>

                <p className="text-gray-400 mb-8">

                    {new Date(fromDate).toLocaleDateString("en-IN")}

                    {"  "}to{"  "}

                    {new Date(toDate).toLocaleDateString("en-IN")}

                </p>

                <div className="grid grid-cols-3 gap-5">

                    <div className="bg-[#1a1a1a] rounded-xl p-6">

                        <FaWallet
                            size={30}
                            className="text-yellow-400 mb-4"
                        />

                        <p className="text-gray-400">
                            Total
                        </p>

                        <h2 className="text-3xl font-bold text-white mt-2">
                            {formatCurrency(summary.total)}
                        </h2>

                    </div>

                    <div className="bg-[#1a1a1a] rounded-xl p-6">

                        <FaMoneyBillWave
                            size={30}
                            className="text-green-400 mb-4"
                        />

                        <p className="text-gray-400">
                            Cash
                        </p>

                        <h2 className="text-3xl font-bold text-white mt-2">
                            {formatCurrency(summary.cash)}
                        </h2>

                    </div>

                    <div className="bg-[#1a1a1a] rounded-xl p-6">

                        <FaMobileAlt
                            size={30}
                            className="text-blue-400 mb-4"
                        />

                        <p className="text-gray-400">
                            UPI
                        </p>

                        <h2 className="text-3xl font-bold text-white mt-2">
                            {formatCurrency(summary.upi)}
                        </h2>

                    </div>

                </div>

                <div className="flex justify-between items-center mt-8">

                    <div className="text-gray-400">

                        Transactions :

                        <span className="text-white font-semibold ml-2">

                            {transactions.length}

                        </span>

                    </div>

                    <div className="flex gap-3">

                        {/* We'll wire these later */}

                        <button
                            className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg text-white"
                        >
                            Export Excel
                        </button>

                        <button
                            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg text-white"
                        >
                            Export PDF
                        </button>

                        <button
                            onClick={onClose}
                            className="bg-gray-700 hover:bg-gray-800 px-5 py-2 rounded-lg text-white"
                        >
                            Close
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default LedgerSummaryModal;