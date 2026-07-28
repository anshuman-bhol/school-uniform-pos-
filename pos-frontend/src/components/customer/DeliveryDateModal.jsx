import Modal from "../shared/Modal";

const DeliveryDateModal = ({
    isOpen,
    onClose,
    deliveryDate,
    setDeliveryDate,
    deliveryTime,
    setDeliveryTime,
    onContinue,
}) => {

    const now = new Date();
    const today = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`; return (
        <Modal
            isOpen={isOpen}
            title="Select Delivery Date"
            onClose={onClose}
        >
            <div>
                <label className="block text-[#ababab] mb-2 text-sm font-medium">
                    Delivery Date
                </label>

                <input
                    type="date"
                    value={deliveryDate}
                    min={today}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-[#1f1f1f] border border-[#333] rounded-lg p-3 text-white outline-none"
                />
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                    Delivery Time
                </label>

                <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full rounded-lg border p-2"
                />
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={onClose}
                    className="w-full bg-[#444] text-white rounded-lg py-3"
                >
                    Cancel
                </button>

                <button
                    onClick={() => onContinue(deliveryDate)}
                    className="w-full bg-[#f6b100] text-white font-bold rounded-lg py-3 hover:text-yellow-800"
                >
                    Continue
                </button>
            </div>
        </Modal>
    );
};

export default DeliveryDateModal;