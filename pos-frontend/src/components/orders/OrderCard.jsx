import { FaCheckCircle, FaCircle, FaUserTie, FaCut, FaBoxOpen, } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils";
const OrderCard = ({ order }) => {
  console.log(order)
  const readyMadeStatus = order.orderStatus?.readyMade?.status;
  const tailoringStatus = order.orderStatus?.tailoring?.status;
  const hasReadyMade = order.items.some(item => item.itemType === "ReadyMade");
  const hasTailoring = order.items.some(item => item.itemType === "Tailoring");
  const renderStatus = (status, type) => {
    switch (status) {
      case "Order Placed":
        return (
          <>
            <p className="text-yellow-400 bg-[#4a452e] p-2 rounded-lg">
              <FaCircle className="inline mr-2" />
              {type} : Order Placed
            </p>
            <p className="text-[#ececec] text-sm">
              {type === "Tailoring"
                ? "Waiting for tailor assignment"
                : "Item available in stock"}
            </p>
          </>
        );

      case "Tailor Assigned":
        return (
          <>
            <p className="text-blue-400 bg-[#243c5a] p-2 rounded-lg">
              <FaUserTie className="inline mr-2" />
              {type} : Tailor Assigned
            </p>
            {type === "Tailoring" && (
              <p className="text-[#ececec] text-sm">
                {order.tailor?.name}
              </p>
            )}
          </>
        );

      case "Stitching":
        return (
          <>
            <p className="text-orange-400 bg-[#4f3316] p-2 rounded-lg">
              <FaCut className="inline mr-2" />
              {type} : Stitching
            </p>
            <p className="text-[#ececec] text-sm">
              Work in progress
            </p>
          </>
        );

      case "Ready":
        return (
          <>
            <p className="text-green-400 bg-[#2e4a40] p-2 rounded-lg">
              <FaCheckCircle className="inline mr-2" />
              {type} : Ready
            </p>
            <p className="text-[#ececec] text-sm">
              Ready for delivery
            </p>
          </>
        );

      case "Delivered":
        return (
          <>
            <p className="text-purple-400 bg-[#3d3058] p-2 rounded-lg">
              <FaBoxOpen className="inline mr-2" />
              {type} : Delivered
            </p>
            <p className="text-[#ececec] text-sm">
              {type === "Tailoring"
                ? "Order completed"
                : "Delivered from stock"}
            </p>
          </>
        );

      default:
        return null;
    }
  };
  return (
    <div className="w-112.5 bg-[#262626] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">{getAvatarName(order.customerDetails.name)}</button>
        <div className="flex items-center justify-between w-full">
          <div className="text-[#f5f5f5] text-lg font-semibold">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">{order.customerDetails.name}</h1>
            <p className="text-[#ababab] text-sm">Invoice : {order.invoiceNumber}</p>
            <p className="text-[#ababab] text-sm">Delivery :{" "} {formatDateAndTime(order.customerDetails.deliveryDate)}</p>
          </div>
          <div className="flex flex-col items-end gap-3 font-medium">
            {hasReadyMade && renderStatus(readyMadeStatus, "Ready-made")}
            {hasReadyMade && hasTailoring && (<hr className="w-full border-gray-600" />)}
            {hasTailoring && renderStatus(tailoringStatus, "Tailoring")}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[#ababab] font-light">
        <p>{formatDateAndTime(order.completedAt || order.orderDate)}</p>
        <p>{order.items.length} Items</p>
        <p className={order.paymentStatus === "Paid"
          ? "text-green-400"
          : "text-yellow-400"
        }>{order.paymentStatus}
        </p>
      </div>
      {order.tailor && (
        <div className="mt-3 text-sm text-[#ababab]">
          Tailor : {order.tailor.name}
        </div>
      )}
      <hr className=" w-full mt-4 border-t border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-xl font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">₹{order.bills.finalAmount.toFixed(2)}</p>
      </div>
    </div>
  )
}

export default OrderCard
