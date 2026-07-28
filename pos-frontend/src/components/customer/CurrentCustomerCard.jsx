import { useSelector } from "react-redux";

const CurrentCustomerCard = ({ onChange }) => {
  const customer = useSelector((state) => state.customer);

  if (!customer.customerName) return null;

  return (
    <div className="mx-10 mt-4 bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-white text-lg font-semibold">
            👤 {customer.customerName}
          </h2>
          <p className="text-white mt-1">
            📞 {customer.customerPhone}
          </p>
          <p className="text-white pl-1">
            🍽 Tailor {customer.tailor?.tailorNo || "Not Selected"}
          </p>
          <p className="text-white">
            👥 {customer.guests} Guests
          </p>
        </div>

        <button
          onClick={onChange}
          className="bg-[#f6b100] text-white font-bold px-4 py-2 rounded-lg hover:text-yellow-900"
        >
          Change Details
        </button>
      </div>
    </div>
  );
};

export default CurrentCustomerCard;