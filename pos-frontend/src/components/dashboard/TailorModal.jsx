import { IoMdCloseCircle } from "react-icons/io";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { addTailor, updateTailor } from "../../https";

const TailorModal = ({ setIsTailorModalOpen, tailor = null, }) => {
    const [tailorData, setTailorData] = useState({
        name: tailor?.name || "",
        phone: tailor?.phone || "",
        specialization: tailor?.specialization || "",
    });
    const queryClient = useQueryClient();

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setTailorData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCloseModal = () => {
        setIsTailorModalOpen(false);
    };

    const addTailorMutation = useMutation({
    mutationFn: addTailor,

    onSuccess: (res) => {
        queryClient.invalidateQueries({
            queryKey: ["tailors"],
        });

        enqueueSnackbar(res.data.message, {
            variant: "success",
        });

        setIsTailorModalOpen(false);
    },

    onError: (error) => {
        enqueueSnackbar(
            error.response?.data?.message || "Unable to add tailor.",
            {
                variant: "error",
            }
        );
    },
});

const updateTailorMutation = useMutation({
    mutationFn: updateTailor,

    onSuccess: (res) => {
        queryClient.invalidateQueries({
            queryKey: ["tailors"],
        });

        enqueueSnackbar(res.data.message, {
            variant: "success",
        });

        setIsTailorModalOpen(false);
    },

    onError: (error) => {
        enqueueSnackbar(
            error.response?.data?.message || "Unable to update tailor.",
            {
                variant: "error",
            }
        );
    },
});

    const handleSubmit = (e) => {
        e.preventDefault();

        if (tailor) {
    updateTailorMutation.mutate({
        tailorId: tailor._id,
        ...tailorData,
    });
} else {
    addTailorMutation.mutate(tailorData);
}
    };

    return (
        <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="bg-[#262626] p-6 rounded-xl shadow-lg w-105"
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">
                        {tailor ? "Edit Tailor" : "Add Tailor"}
                    </h2>

                    <button onClick={handleCloseModal}>
                        <IoMdCloseCircle
                            size={26}
                            className="text-white hover:text-red-500"
                        />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 mt-8"
                >
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">
                            Tailor Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={tailorData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-[#1f1f1f] rounded-lg p-4 text-white outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-2">
                            Phone Number
                        </label>

                        <input
                            type="text"
                            maxLength={10}
                            name="phone"
                            value={tailorData.phone}
                            onChange={handleInputChange}
                            className="w-full bg-[#1f1f1f] rounded-lg p-4 text-white outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-2">
                            Specialization
                        </label>

                        <input
                            type="text"
                            name="specialization"
                            placeholder="Ladies, Gents, Blouse..."
                            value={tailorData.specialization}
                            onChange={handleInputChange}
                            className="w-full bg-[#1f1f1f] rounded-lg p-4 text-white outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-yellow-400 hover:bg-yellow-300 rounded-lg py-3 font-bold text-gray-900"
                    >
                        {tailor ? "Save Changes" : "Add Tailor"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default TailorModal;