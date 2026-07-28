import { useState } from "react";

const PriceModal = ({
    item,
    onClose,
    onSave,
}) => {
    const [price, setPrice] = useState(
        item.pricePerQuantity || ""
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-[#262626] rounded-xl p-6 w-96">
                <h2 className="text-xl font-bold text-white mb-6">
                    {item.name}
                </h2>
                <label className="text-gray-300 block mb-2">
                    Unit Price
                </label>
                <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                        setPrice(e.target.value)
                    }
                    className="w-full bg-[#1f1f1f] rounded-lg p-3 text-white outline-none"
                />
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-[#444] py-3 rounded-lg text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() =>
                            onSave(Number(price))
                        }
                        className="flex-1 bg-green-600 py-3 rounded-lg text-white"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
export default PriceModal;