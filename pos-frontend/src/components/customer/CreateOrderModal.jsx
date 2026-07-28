import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "../shared/Modal";
import { setCustomer } from "../../redux/slices/customerSlice";
import { enqueueSnackbar } from "notistack";

const CreateOrderModal = ({
  isOpen,
  onClose,
  onSuccess,
  navigateAfterCreate = true,
  customer,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: customer?.customerName || "",
    phone: customer?.customerPhone || "",
    remarks: customer?.remarks || "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      remarks: "",
    });
  };

  const handleCreateOrder = () => {
    if (!formData.name.trim()) {
      enqueueSnackbar("Please enter customer name.", {
        variant: "warning",
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      enqueueSnackbar(
        "Please enter a valid 10-digit mobile number.",
        {
          variant: "warning",
        }
      );
      return;
    }

    dispatch(
      setCustomer({
        name: formData.name,
        phone: formData.phone,
        remarks: formData.remarks,
      })
    );

    onSuccess?.();

    resetForm();

    onClose();

    if (navigateAfterCreate) {
      navigate("/products");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="New Garment Order"
      disableClose={true}
      onClose={() => {
        resetForm();
        onClose();
      }}
    >
      <div>
        <label className="block text-[#ababab] mb-2 text-sm font-medium">
          Customer Name
        </label>

        <div className="flex items-center border border-[#333] rounded-lg p-3 px-4 bg-[#1f1f1f]">
          <input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            type="text"
            placeholder="Enter Customer Name"
            className="bg-transparent flex-1 text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-[#ababab] mb-2 text-sm font-medium">
          Customer Number
        </label>

        <div className="flex items-center border border-[#333] rounded-lg p-3 px-4 bg-[#1f1f1f]">
          <input
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="9999999999"
            className="bg-transparent flex-1 text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-[#ababab] mb-2 text-sm font-medium">
          Remarks
        </label>

        <textarea
          rows={3}
          value={formData.remarks}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              remarks: e.target.value,
            }))
          }
          placeholder="Special stitching instructions..."
          className="w-full bg-[#1f1f1f] border border-[#333] rounded-lg p-3 text-white outline-none resize-none"
        />
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="w-full bg-[#444] text-white rounded-lg py-3"
        >
          Cancel
        </button>

        <button
          onClick={handleCreateOrder}
          className="w-full bg-[#f6b100] text-white font-bold rounded-lg py-3 hover:text-yellow-800"
        >
          Create Order
        </button>
      </div>
    </Modal>
  );
};

export default CreateOrderModal;