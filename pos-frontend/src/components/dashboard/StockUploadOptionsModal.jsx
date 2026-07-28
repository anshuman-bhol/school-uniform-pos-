const StockUploadOptionsModal = ({
    onClose,
    onManual,
    onBulk,
}) => {

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

            <div className="bg-[#262626] rounded-xl p-6 w-105">

                <h2 className="text-white text-2xl font-bold text-center mb-8">
                    Stock Upload
                </h2>

                <button
                    onClick={onManual}
                    className="w-full bg-[#025cca] text-white py-3 rounded-lg mb-4 hover:bg-[#014ca8]"
                >
                    Manual Upload
                </button>

                <button
                    onClick={onBulk}
                    className="w-full bg-[#f6b100] text-[#1f1f1f] py-3 rounded-lg font-semibold hover:bg-[#e2a400]"
                >
                    Bulk Upload
                </button>

                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-[#444] text-white py-3 rounded-lg"
                >
                    Back
                </button>

            </div>

        </div>
    );

};

export default StockUploadOptionsModal;