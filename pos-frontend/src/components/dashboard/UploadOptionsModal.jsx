const UploadOptionsModal = ({
    onClose,
    onCatalogue,
    onMerge,
    onStock,
}) => {

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

            <div className="bg-[#262626] rounded-xl p-6 w-105">

                <h2 className="text-white text-2xl font-bold text-center mb-8">
                    Upload Data
                </h2>

                {/* Replace Catalogue */}
                <button
                    onClick={onCatalogue}
                    className="w-full bg-[#025cca] text-white py-3 rounded-lg mb-4 hover:bg-[#014ca8]"
                >
                    New Catalogue
                </button>

                {/* Merge Products */}
                <button
                    onClick={onMerge}
                    className="w-full bg-[#14a44d] text-white py-3 rounded-lg mb-4 hover:bg-[#11853f]"
                >
                    Add Products
                </button>

                {/* Stock */}
                <button
                    onClick={onStock}
                    className="w-full bg-[#f6b100] text-[#1f1f1f] py-3 rounded-lg font-semibold hover:bg-[#e2a400]"
                >
                    Stock Upload
                </button>

                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-[#444] text-white py-3 rounded-lg hover:bg-[#555]"
                >
                    Cancel
                </button>

            </div>

        </div>
    );

};

export default UploadOptionsModal;