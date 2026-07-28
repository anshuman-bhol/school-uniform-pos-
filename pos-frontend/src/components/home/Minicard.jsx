import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
const Minicard = ({title, icon, number, cashAmount, onlineAmount, todayPending, previousPending,}) => {
    return (
    <div className="bg-[#1a1a1a] py-5 px-5 rounded-lg w-[50%] flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
          {title}
        </h1>

        <button
          className={`${
            title === "Total Earnings"
              ? "bg-[#02ca3a]"
              : "bg-[#f6b100]"
          } p-3 rounded-lg text-[#f5f5f5] text-2xl`}
        >
          {icon}
        </button>
      </div>

      <div>
        <h1 className="text-[#f5f5f5] text-4xl font-bold mt-5">
          {title === "Total Earnings" ? `₹${number}` : number}
        </h1>

        {title === "Total Earnings" ? (
          <div className="mt-4 pt-3 border-t border-[#333] flex justify-between items-center h-12">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-green-500 text-lg" />
              <span className="text-[#ababab] font-semibold text-sm">
                Cash
              </span>
              <span className="text-white font-semibold">
                ₹{cashAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FaCreditCard className="text-blue-500 text-lg" />
              <span className="text-[#ababab] font-semibold text-sm">
                Online
              </span>
              <span className="text-white font-semibold">
                ₹{onlineAmount.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-[#333] flex justify-between items-center h-12">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="text-yellow-400 font-semibold text-sm">
                Today: {todayPending}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-red-400 font-semibold text-sm">
                Previous: {previousPending}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Minicard;