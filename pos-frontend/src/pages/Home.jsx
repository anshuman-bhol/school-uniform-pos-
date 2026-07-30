import BottomNav from '../components/shared/BottomNav'
import Greetings from '../components/home/Greetings'
import Minicard from '../components/home/Minicard'
import { useQuery } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { getOrders } from '../https'
import { enqueueSnackbar } from 'notistack'
import RecentOrders from '../components/home/RecentOrders'
import TopSelling from '../components/home/TopSelling'
import { TbCoinRupeeFilled } from "react-icons/tb"
import { GrInProgress } from "react-icons/gr";
const Home = () => {

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders()
    },
    placeholderData: keepPreviousData
  })

  const isToday = (date) => {
    if (!date) return false;

    const today = new Date();
    const d = new Date(date);

    return (
      today.getDate() === d.getDate() &&
      today.getMonth() === d.getMonth() &&
      today.getFullYear() === d.getFullYear()
    );
  };

  const todaysOrders =
    (resData?.data?.data || []).filter((order) =>
      isToday(order.orderDate)
    );

  const pendingOrders =
    (resData?.data?.data || []).filter((order) => {

      const readyMadeStatus =
        order.orderStatus?.readyMade?.status;

      const tailoringStatus =
        order.orderStatus?.tailoring?.status;

      const readyMadeDelivered =
        !readyMadeStatus ||
        readyMadeStatus === "Delivered";

      const tailoringDelivered =
        !tailoringStatus ||
        tailoringStatus === "Delivered";

      return !(readyMadeDelivered && tailoringDelivered);

    });

  const todayPending = pendingOrders.filter((order) =>
    isToday(order.orderDate)
  ).length;

  const previousPending = pendingOrders.filter(
    (order) => !isToday(order.orderDate)
  ).length;

  const cashEarnings = todaysOrders.reduce((total, order) => {
    return order.paymentMethod === "Cash"
      ? total + order.bills.finalAmount
      : total;
  }, 0);

  const onlineEarnings = todaysOrders.reduce((total, order) => {
    return order.paymentMethod === "Online"
      ? total + order.bills.finalAmount
      : total;
  }, 0);

  const totalEarnings = cashEarnings + onlineEarnings;
  const pendingCount = pendingOrders.length;

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" })
  }

  return (
    <section className="bg-black h-full overflow-hidden relative">
      <div className="flex h-[calc(100%-5rem)] gap-3 px-3 pt-3">
        <div className="flex-3 flex flex-col min-h-0">
          <Greetings />
          <div className="flex items-stretch w-full gap-3 px-8 mt-4">
            <Minicard title="Total Earnings" icon={<TbCoinRupeeFilled />} number={totalEarnings.toFixed(0)} cashAmount={cashEarnings} onlineAmount={onlineEarnings} />
            <Minicard title="Pending Orders" icon={<GrInProgress />} number={pendingCount} todayPending={todayPending} previousPending={previousPending} />
          </div>
          <div className="flex-1 min-h-0 mt-4">
            <RecentOrders />
          </div>
        </div>
      
      <div className="flex-2 min-h-0">
        <TopSelling />
      </div>
      </div>
      <BottomNav />
    </section>
  )
}

export default Home
