import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";
import { useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { MdCalendarToday } from "react-icons/md";

const CustomerInfo = () => {

    const [dateTime] = useState(new Date());

    const customerData = useSelector((state) => state.customer);

    return (
        <div className="flex items-center justify-between px-4 py-3">

            <div className="flex flex-col items-start">

                <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
                    {customerData.customerName || "Customer Name"}
                </h1>

                <p className="text-xs text-[#ababab] mt-1 font-medium">
                    Order #
                    {customerData.orderId || "N/A"}
                </p>

                <div className="flex items-center gap-2 mt-2 text-xs text-[#ababab] font-medium">

                    <FaPhoneAlt size={10} />

                    <span>
                        {customerData.customerPhone || "No Phone"}
                    </span>

                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-[#ababab] font-medium">

                    <MdCalendarToday size={11} />

                    <span>
                        Delivery :
                        {" "}
                        {customerData.deliveryDate
                            ? formatDate(customerData.deliveryDate)
                            : formatDate(dateTime)}
                    </span>

                </div>

            </div>

            <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">

                {getAvatarName(customerData.customerName) || "CN"}

            </button>

        </div>
    );
};

export default CustomerInfo;