import { FaSearch } from "react-icons/fa";
import OrderList from "./OrderList"
import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../../https";
import { keepPreviousData } from "@tanstack/react-query";
const RecentOrders = () => {

  const [search, setSearch] = useState("");
  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders()
    },
    placeholderData: keepPreviousData
  })

  const statusPriority = {
    Ready: 0,
    Stitching: 1,
    "Tailor Assigned": 2,
    "Order Placed": 3,
  };

  const recentOrders = (resData?.data?.data || [])
    .filter((order) => {

        const keyword = search.toLowerCase();

        const matchesSearch =
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
    );

        const tailoringStatus =
            order.orderStatus?.tailoring?.status;

        return (
            [
                "Order Placed",
                "Tailor Assigned",
                "Stitching",
                "Ready",
            ].includes(tailoringStatus) &&
            matchesSearch
        );

    })
    .sort((a, b) => {

        const statusA =
            a.orderStatus?.tailoring?.status;

        const statusB =
            b.orderStatus?.tailoring?.status;

        const priorityA =
            statusPriority[statusA] ?? 999;

        const priorityB =
            statusPriority[statusB] ?? 999;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        return (
            new Date(b.orderDate) -
            new Date(a.orderDate)
        );

    });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" })
  }

  return (
    <div className="px-8 mt-4">
      <div className="bg-[#1a1a1a] w-full h-77 rounded-lg">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking wide">Recent Orders</h1>
          <a href="" className="text-[#025cca] text-sm font-semibold">View all</a>
        </div>

        <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[20px] px-6 py-4 mx-6">
          <FaSearch className='text-[#f5f5f5]' />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice, customer or phone"
            className="outline-none text-white px-2 py-1 rounded-[5px]"
          />
        </div>
        <div className="m-3 px-3 gap-2 overflow-y-scroll h-38 scrollbar-none">
          {
            recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                return <OrderList key={order._id} order={order} />
              })
            ) : (
              <p className="col-span-3 text-gray-500">No Orders avialable</p>
            )}
        </div>
      </div>
    </div>
  )
}

export default RecentOrders
