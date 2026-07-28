import { FaPrint, FaSearch } from "react-icons/fa";
import { keepPreviousData, useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
import AssignTailorModal from "../tailors/AssignTailorModal";
import { getOrders, updateOrderStatus } from "../../https";
import { enqueueSnackbar } from "notistack";
import { formatDateAndTime } from "../../utils";
import { useState } from "react";
import OrderDetailsModal from "../orders/OrderModal";
import SummaryCard from "../inventory/SummaryCard";
import TailoringStatusSelect from "../orders/TailoringStatusSelect";

console.log("RecentOrders rendered");

const RecentOrders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [selectedTailorOrder, setSelectedTailorOrder] = useState(null);

  const queryClient = useQueryClient();

  const handleStatusChange = ({
    orderId,
    orderStatus,
    currentStatus,
    workflow,
    order,
  }) => {
    if (currentStatus === orderStatus) return;

    const hasTailoring = order.items.some(
      (item) => item.itemType === "Tailoring"
    );

    // Delivered -> previous state
    // Assign tailor from Order Placed
    if (
      hasTailoring &&
      currentStatus === "Order Placed" &&
      orderStatus === "Tailor Assigned"
    ) {
      setSelectedTailorOrder({
        ...order,
        nextStatus: "Tailor Assigned",
      });

      setShowTailorModal(true);
      return;
    }

    // Reassign tailor after reopening a delivered order
    if (
      hasTailoring &&
      currentStatus === "Delivered" &&
      orderStatus !== "Delivered"
    ) {
      setSelectedTailorOrder({
        ...order,
        nextStatus: orderStatus,
      });

      setShowTailorModal(true);
      return;
    }

    if (workflow === "tailoring") {
      orderStatusUpdateMutation.mutate({
        orderId,
        tailoringStatus: orderStatus,
      });
    }
  };
  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, tailoringStatus, tailor }) =>
      updateOrderStatus({
        orderId,
        tailoringStatus,
        tailor,
      }),

    onSuccess: () => {
      enqueueSnackbar(
        "Order updated successfully",
        {
          variant: "success",
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tailors"],
      });
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
        "Unable to update order",
        {
          variant: "error",
        }
      );
    },
  });

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrders(),
    placeholderData: keepPreviousData,
  });

  const orders = [...(resData?.data.data || [])];
  console.log(
  "Orders:",
  orders.map(o => ({
    invoice: o.invoiceNumber,
    finalAmount: o.bills.finalAmount,
    totalWithTax: o.bills.totalWithTax,
  }))
);
  const selectedOrder = orders.find(order => order._id === selectedOrderId) || null;

  const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);

    return (
      today.getDate() === d.getDate() &&
      today.getMonth() === d.getMonth() &&
      today.getFullYear() === d.getFullYear()
    );
  };

  const stitchingCount = orders.filter(o => o.orderStatus?.tailoring?.status === "Stitching").length;
  const assignedCount = orders.filter(o => o.orderStatus?.tailoring?.status === "Tailor Assigned").length;
  const orderPlacedCount = orders.filter(o => o.orderStatus?.tailoring?.status === "Order Placed").length;
  const readyCount = orders.filter(o => o.orderStatus?.tailoring?.status === "Ready").length;
  const deliveredTodayCount = orders.filter(
    o =>
      o.orderStatus?.tailoring?.status === "Delivered" &&
      o.completedAt &&
      isToday(o.completedAt)
  ).length;
  const activeCount = stitchingCount + assignedCount + orderPlacedCount + readyCount;

  const statusPriority = {
    Stitching: 0,
    "Tailor Assigned": 1,
    "Order Placed": 2,
    Ready: 3,
    Delivered: 4,
  };

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

  const displayOrders = [...orders]
    .filter(order => {

      // Search always wins
      if (search.trim() !== "") {

        const keyword = search.toLowerCase();

        return (
          order.customerDetails.name
            .toLowerCase()
            .includes(keyword) ||

          order.customerDetails.phone
            ?.toString()
            .includes(keyword) ||

          order.invoiceNumber
            ?.toLowerCase()
            .includes(keyword) ||

          order.items.some(item =>
            item.school
              ?.toLowerCase()
              .includes(keyword)
          )
        );
      }

      // Dashboard
      const tailoringStatus = order.orderStatus?.tailoring?.status;
      if (statusFilter !== "All") {
        if (statusFilter === "Delivered") {
          return (
            tailoringStatus === "Delivered" &&
            order.completedAt &&
            isToday(order.completedAt)
          );
        }
        return tailoringStatus === statusFilter;
      }

      const readyMadeStatus = order.orderStatus?.readyMade?.status;

      // Tailoring orders still in workflow
      if (
        tailoringStatus &&
        [
          "Order Placed",
          "Tailor Assigned",
          "Stitching",
          "Ready",
        ].includes(tailoringStatus)
      ) {
        return true;
      }

      // Ready-made orders delivered today
      if (
        readyMadeStatus === "Delivered" &&
        order.completedAt &&
        isToday(order.completedAt)
      ) {
        return true;
      }

      // Tailoring delivered today
      if (
        tailoringStatus === "Delivered" &&
        order.completedAt &&
        isToday(order.completedAt)
      ) {
        return true;
      }
      return false;
    })
    .sort((a, b) => {

      if (search.trim() !== "") {
        const dateA = new Date(a.completedAt || a.orderDate);
        const dateB = new Date(b.completedAt || b.orderDate);
        return dateB - dateA;
      }

      const statusA =
        a.orderStatus?.tailoring?.status ??
        a.orderStatus?.readyMade?.status;

      const statusB =
        b.orderStatus?.tailoring?.status ??
        b.orderStatus?.readyMade?.status;

      const priority =
        statusPriority[statusA] -
        statusPriority[statusB];

      if (priority !== 0) {
        return priority;
      }

      return (
        new Date(b.orderDate) -
        new Date(a.orderDate)
      );
    })

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" })
  }

  return (
    <div className="px-16 mx-auto bg-[#262626] rounded-lg h-full flex flex-col">
      <div className="grid grid-cols-6 gap-4 mt-5 mb-5 font-medium">

        <div onClick={() => setStatusFilter("All")}>
          <SummaryCard
            title="Active"
            value={activeCount}
          />
        </div>

        <div onClick={() => setStatusFilter("Stitching")}>
          <SummaryCard
            title="Stitching"
            value={stitchingCount}
          />
        </div>

        <div onClick={() => setStatusFilter("Tailor Assigned")}>
          <SummaryCard
            title="Assigned"
            value={assignedCount}
          />
        </div>

        <div onClick={() => setStatusFilter("Order Placed")}>
          <SummaryCard
            title="Order Placed"
            value={orderPlacedCount}
          />
        </div>

        <div onClick={() => setStatusFilter("Ready")}>
          <SummaryCard
            title="Ready"
            value={readyCount}
          />
        </div>

        <div onClick={() => setStatusFilter("Delivered")}>
          <SummaryCard
            title="Delivered Today"
            value={deliveredTodayCount}
          />
        </div>

      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#f5f5f5] text-xl font-semibold">
          Recent Orders
        </h2>

        <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[20px] p-5">
          <FaSearch className='text-[#f5f5f5]' />
          <input
            type="text"
            placeholder="Search customer name/ phone / order"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#333] outline-none text-white px-2 py-1 rounded-[5px] w-75"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <table className="w-full text-left text-[#f5f5f5] border-separate border-spacing-0">
          <thead className="sticky top-0 bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3 bg-[#333]">Order ID</th>
              <th className="p-3 bg-[#333]">Customer</th>
              <th className="p-3 bg-[#333]">Status</th>
              <th className="p-3 bg-[#333]">Date & Time</th>
              <th className="p-3 bg-[#333]">Items</th>
              <th className="p-3 bg-[#333]">Tailor</th>
              <th className="p-3 bg-[#333]">Total</th>
              <th className="p-3 bg-[#333] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders?.map((order) => {
              const hasTailoring = order.items.some(
                (item) => item.itemType === "Tailoring"
              );
              const hasReadyMade = order.items.some(
                (item) => item.itemType === "ReadyMade"
              );

              const tailoringStatus =
                order.orderStatus?.tailoring?.status;

              const readyMadeStatus =
                order.orderStatus?.readyMade?.status;

              return (
                <tr
                  key={order._id}
                  className="border-b border-gray-600 hover:bg-[#47475236]"
                >
                  <td className="p-4">#{order.invoiceNumber}</td>

                  <td className="p-4">
                    {order.customerDetails.name}
                  </td>

                  <td className="p-4">

                    {hasReadyMade && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Ready-made
                        </p>

                        <div className={`rounded-lg border px-3 py-2 text-center font-medium ${getStatusColor("Delivered")}`}>
                          Delivered
                        </div>
                      </div>
                    )}

                    {hasTailoring && (
                      <div className={hasReadyMade ? "mt-3" : ""}>

                        <p className="text-xs text-gray-400 mb-1">
                          Tailoring
                        </p>

                        <TailoringStatusSelect
                          order={order}
                          tailoringStatus={tailoringStatus}
                          getStatusColor={getStatusColor}
                          onStatusChange={(status) =>
                            handleStatusChange({
                              orderId: order._id,
                              currentStatus: tailoringStatus,
                              orderStatus: status,
                              workflow: "tailoring",
                              order,
                            })
                          }
                        />

                      </div>
                    )}

                  </td>

                  <td className="p-4">
                    {formatDateAndTime(
                      (hasTailoring
                        ? tailoringStatus
                        : readyMadeStatus) === "Delivered" && order.completedAt
                        ? order.completedAt
                        : order.orderDate
                    )}
                  </td>

                  <td className="p-4">
                    {order.items.length} Items
                  </td>

                  <td className="p-4">
                    {order.tailor ? order.tailor.name : "-"}
                  </td>

                  <td className="p-4">
                    ₹{(order.bills.finalAmount ?? order.bills.totalWithTax).toFixed(2)}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedOrderId(order._id)}
                      className="text-blue-400 hover:text-blue-500 transition"
                    >
                      <FaPrint size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrderId(null)}
          />
        )}
        {showTailorModal && (
          <AssignTailorModal
            isOpen={showTailorModal}
            order={selectedTailorOrder}
            onClose={() => {
              setShowTailorModal(false);
              setSelectedTailorOrder(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RecentOrders;