import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";

const LedgerDetailsModal = ({
    transactions,
    fromDate,
    toDate,
    onClose,
}) => {

    return (

        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

            <div className="bg-[#262626] rounded-xl w-[95%] h-[90%] flex flex-col">

                {/* Header */}

                <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">

                    <div>

                        <h2 className="text-2xl font-bold text-white">

                            Payment Details

                        </h2>

                        <p className="text-gray-400 mt-1">

                            {new Date(fromDate).toLocaleDateString("en-IN")}

                            {"  "}to{"  "}

                            {new Date(toDate).toLocaleDateString("en-IN")}

                        </p>

                    </div>

                    <div className="flex gap-3">

                        <button
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                        >
                            <FaFileExcel />
                            Export Excel
                        </button>

                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                        >
                            <FaFilePdf />
                            Export PDF
                        </button>

                        <button
                            onClick={onClose}
                            className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg"
                        >
                            Close
                        </button>

                    </div>

                </div>

                {/* Table */}

                <div className="flex-1 overflow-y-auto scrollbar-none p-6">

                    <table className="w-full text-left">

                        <thead className="sticky top-0 bg-[#333]">

                            <tr className="text-gray-400">

                                <th className="p-3">
                                    Time
                                </th>

                                <th className="p-3">
                                    Customer
                                </th>

                                <th className="p-3">
                                    Cash
                                </th>

                                <th className="p-3">
                                    UPI
                                </th>

                                <th className="p-3">
                                    Total
                                </th>

                                <th className="p-3">
                                    Received By
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                transactions.length === 0 ?

                                    (

                                        <tr>

                                            <td
                                                colSpan={6}
                                                className="text-center text-gray-400 py-10"
                                            >

                                                No transactions found.

                                            </td>

                                        </tr>

                                    )

                                    :

                                    transactions.map(transaction => (

                                        <tr
                                            key={
                                                transaction.orderId +
                                                transaction.time
                                            }
                                            className="border-b border-[#3a3a3a]"
                                        >

                                            <td className="p-4 text-white">

                                                {

                                                    new Date(transaction.time)
                                                        .toLocaleTimeString(
                                                            "en-IN",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            }
                                                        )

                                                }

                                            </td>

                                            <td className="p-4 text-white font-medium">

                                                {transaction.customer}

                                            </td>

                                            <td className="p-4 text-green-400 font-semibold">

                                                {formatCurrency(transaction.cash)}

                                            </td>

                                            <td className="p-4 text-blue-400 font-semibold">

                                                {formatCurrency(transaction.upi)}

                                            </td>

                                            <td className="p-4 text-yellow-400 font-semibold">

                                                {formatCurrency(transaction.total)}

                                            </td>

                                            <td className="p-4 text-gray-300">

                                                {transaction.receivedBy}

                                            </td>

                                        </tr>

                                    ))

                            }

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

};

export default LedgerDetailsModal;