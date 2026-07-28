import { motion } from "framer-motion";
import { IoMdCloseCircle } from "react-icons/io";

const AssignTailorChoiceModal = ({
  onClose,
  onAssignNow,
  onAssignLater,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#262626] rounded-xl w-125 p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-white font-bold">
            Tailor Assignment
          </h2>

          <button onClick={onClose}>
            <IoMdCloseCircle
              size={28}
              className="text-white hover:text-red-500"
            />
          </button>
        </div>

        <p className="text-gray-300 mb-8">
          Would you like to assign a tailor now or create the order and assign one later?
        </p>

        <div className="space-y-4">

          <button
            onClick={onAssignNow}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Assign Tailor Now
          </button>

          <button
            onClick={onAssignLater}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition"
          >
            Assign Later
          </button>

        </div>
      </motion.div>
    </div>
  );
};

export default AssignTailorChoiceModal;