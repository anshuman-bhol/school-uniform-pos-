import { FaCheckCircle } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { getAvatarName } from "../../utils";

const OrderList = ({ order }) => {
  const status = order.orderStatus?.tailoring?.status;
  return (
    <div className="flex items-center gap-6 mb-4">
      <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">{getAvatarName(order.customerDetails.name)}</button>
      <div className="flex items-center justify-between w-full">
        <div className="text-[#f5f5f5] text-lg font-semibold">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">{order.customerDetails.name}</h1>
          <p className="text-xs text-gray-300 font-semibold">
            Delivery:
            {" "}
            {new Date(
              order.customerDetails.deliveryDate
            ).toLocaleDateString("en-IN")}
          </p>
          <p className="text-[#ababab] text-sm">
            {
              order.items.filter(
                item => item.itemType === "Tailoring"
              ).length
            } Garments
          </p>        </div>
        <div>
          <div className="text-right">
            <h1 className="text-[#f6b100] font-semibold">
              #{order.invoiceNumber}
            </h1>

            {order.tailor && (
              <p className="text-sm text-gray-400 font-semibold">
                Tailor: {order.tailor.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-col items-end">
            {status === "Order Placed" && (
              <>
                <p className="text-yellow-400 bg-[#4a452e] p-2 rounded-lg">
                  <FaCircle className="inline mr-2" />
                  Order Placed
                </p>

                <p className="text-[#ececec] text-sm">
                  <FaCircle className="inline mr-2 text-yellow-400" />
                  Waiting for tailor assignment
                </p>
              </>
            )}

            {status === "Tailor Assigned" && (
              <>
                <p className="text-cyan-400 bg-[#1e3f4f] p-2 rounded-lg ">
                  <FaCircle className="inline mr-2" />
                  Tailor Assigned
                </p>

                <p className="text-[#ececec] text-sm font-semibold">
                  <FaCircle className="inline mr-2 text-cyan-400" />
                  Tailor: {order.tailor?.name || "Assigned"}
                </p>
              </>
            )}

            {status === "Stitching" && (
              <>
                <p className="text-orange-400 bg-[#4a3623] p-2 rounded-lg">
                  <FaCircle className="inline mr-2" />
                  Stitching
                </p>

                <p className="text-[#ececec] text-sm font-semibold">
                  <FaCircle className="inline mr-2 text-orange-400 " />
                  Garment is being stitched
                </p>
              </>
            )}

            {status === "Ready" && (
              <>
                <p className="text-green-400 bg-[#2e4a40] p-2 rounded-lg">
                  <FaCheckCircle className="inline mr-2" />
                  Ready
                </p>

                <p className="text-[#ececec] text-sm font-semibold">
                  <FaCircle className="inline mr-2 text-green-400" />
                  Ready for delivery
                </p>
              </>
            )}

            {status === "Delivered" && (
              <>
                <p className="text-blue-400 bg-[#243c5a] p-2 rounded-lg">
                  <FaCheckCircle className="inline mr-2" />
                  Delivered
                </p>

                <p className="text-[#ececec] text-sm">
                  <FaCircle className="inline mr-2 text-blue-400" />
                  Order completed
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderList
