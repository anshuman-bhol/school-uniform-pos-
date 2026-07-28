import { motion } from "framer-motion";
import { IoMdCloseCircle } from "react-icons/io";
import { FaUser, FaPhone, FaSchool, FaCalendarAlt, FaTshirt, FaRupeeSign, } from "react-icons/fa";
import TailoringStatusSelect from "../orders/TailoringStatusSelect";

const TailorOrdersModal = ({ tailor, onClose }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case "Order Placed":
                return "bg-yellow-900 text-yellow-300 border-yellow-700";

            case "Tailor Assigned":
                return "bg-sky-900 text-sky-300 border-sky-700";

            case "Stitching":
                return "bg-orange-900 text-orange-300 border-orange-700";

            case "Ready":
                return "bg-green-900 text-green-300 border-green-700";

            case "Delivered":
                return "bg-purple-900 text-purple-300 border-purple-700";

            default:
                return "bg-gray-800 text-gray-300 border-gray-700";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#262626] rounded-xl w-175 max-h-[85vh] overflow-hidden"
            >

                <div className="flex justify-between items-center p-6 border-b border-[#3b3b3b]">
                    <div>
                        <h2 className="text-white text-2xl font-bold">
                            {tailor.name}
                        </h2>
                        <p className="text-gray-400 mt-1">
                            Active Orders ({tailor.currentOrders.length})
                        </p>
                    </div>
                    <button onClick={onClose}>
                        <IoMdCloseCircle
                            size={30}
                            className="text-white hover:text-red-500"
                        />
                    </button>
                </div>

                <div className="p-6 overflow-y-scroll scrollbar-none max-h-[70vh] space-y-4">
                    {tailor.currentOrders.map((order) => {

                        const status = order.orderStatus?.tailoring?.status;

                        const deliveryDate = order.customerDetails?.deliveryDate
                            ? new Date(order.customerDetails.deliveryDate).toLocaleDateString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "short",
                                }
                            )
                            : "-";

                        const totalAmount =
                            order.bills.finalAmount ??
                            order.bills.totalWithTax;

                        const school =
                            order.items[0]?.school || "-";

                        const garments = order.items.reduce(
                            (total, item) => total + item.quantity,
                            0
                        );

                        return (
                            <div
                                key={order._id}
                                className="bg-[#1d1d1d] rounded-xl p-5 border border-[#3b3b3b] hover:border-[#5a5a5a] transition-all"
                            >

                                {/* Header */}
                                <div className="flex justify-between items-start">

                                    <div className="space-y-2">

                                        <h3 className="text-lg font-bold text-white">
                                            #{order.invoiceNumber}
                                        </h3>

                                        <div className="flex items-center gap-2 text-gray-300">
                                            <FaUser />
                                            <span>{order.customerDetails.name}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-300">
                                            <FaPhone />
                                            <span>{order.customerDetails.phone}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-300">
                                            <FaSchool />
                                            <span>{school}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-300">
                                            <FaCalendarAlt />
                                            <span>{deliveryDate}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-300">
                                            <FaTshirt />
                                            <span>{garments} Garments</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-green-400 font-semibold">
                                            <FaRupeeSign />
                                            <span>{totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Status will go here */}
                                    <TailoringStatusSelect
                                        order={order}
                                        tailoringStatus={status}
                                        getStatusColor={getStatusColor}
                                    />

                                </div>

                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

export default TailorOrdersModal;