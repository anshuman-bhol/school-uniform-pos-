import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import BottomNav from "../components/shared/BottomNav"
import OrderCard from "../components/orders/OrderCard"
import BackButton from "../components/shared/BackButton"
import { getOrders } from "../https"
import { enqueueSnackbar } from "notistack"

const Orders = () => {
  const [status, setStatus] = useState("all");

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders()
    },
    placeholderData: keepPreviousData
  })

  const getDisplayStatus = (order) => {
    const hasTailoring = order.items.some(
      item => item.itemType === "Tailoring"
    );

    if (hasTailoring) {
      return order.orderStatus?.tailoring?.status;
    }
    return order.orderStatus?.readyMade?.status;
  };

  const statusPriority = {
    "Order Placed": 0,
    "Tailor Assigned": 1,
    Stitching: 2,
    Ready: 3,
    Delivered: 4,
  };

  const filteredOrders = (resData?.data.data || []).filter((order) => {
    const currentStatus = getDisplayStatus(order);
    switch (status) {
      case "all":
        return true;

      case "placed":
        return currentStatus === "Order Placed";

      case "assigned":
        return currentStatus === "Tailor Assigned";

      case "stitching":
        return currentStatus === "Stitching";

      case "ready":
        return currentStatus === "Ready";

      case "delivered":
        return currentStatus === "Delivered";

      default:
        return true;
    }
  })
    .sort((a, b) => {
      const aPriority = statusPriority[getDisplayStatus(a)] ?? 999;
      const bPriority = statusPriority[getDisplayStatus(b)] ?? 999;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return new Date(b.orderDate) - new Date(a.orderDate);
    });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" })
  }

  return (
    <section className='bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden'>
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-xl font-bold tracking-wide">Orders</h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg ${status === "all" && "bg-[#383838]"
              } rounded-lg px-4 py-2 font-semibold`}
          >
            All
          </button>

          <button
            onClick={() => setStatus("placed")}
            className={`text-[#ababab] text-lg ${status === "placed" && "bg-[#383838]"
              } rounded-lg px-4 py-2 font-semibold`}
          >
            Order Placed
          </button>

          {/* <button
            onClick={() => setStatus("assigned")}
            className={`text-[#ababab] text-lg ${status === "assigned" && "bg-[#383838]"
              } rounded-lg px-4 py-2 font-semibold`}
          >
            Assigned
          </button>

          <button
            onClick={() => setStatus("stitching")}
            className={`text-[#ababab] text-lg ${status === "stitching" && "bg-[#383838]"
              } rounded-lg px-4 py-2 font-semibold`}
          >
            Stitching
          </button>

          <button
            onClick={() => setStatus("ready")}
            className={`text-[#ababab] text-lg ${status === "ready" && "bg-[#383838]"
              } rounded-lg px-4 py-2 font-semibold`}
          >
            Ready
          </button> */}

          <button
            onClick={() => setStatus("delivered")}
            className={`text-[#ababab] text-lg ${status === "delivered" && "bg-[#383838]"
              } rounded-lg px-4 py-2 font-semibold`}
          >
            Delivered
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-6 h-120 items-center justify-center px-10 py-4 overflow-y-scroll scrollbar-none">
        {
          filteredOrders?.length > 0 ? (
            filteredOrders.map((order) => {
              return (
                <OrderCard
                  key={order._id}
                  order={order}
                />
              )
            })
          ) : (
            <p className="col-span-3 text-2xl text-gray-200">
              No Orders available
            </p>
          )
        }
      </div>
      <BottomNav />
    </section>
  )
}

export default Orders
