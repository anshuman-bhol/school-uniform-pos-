import { FaHome } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { MdTableBar } from "react-icons/md";
import { MdMoreHoriz } from "react-icons/md";
import { GiLoincloth } from "react-icons/gi";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import CreateOrderModal from "../customer/CreateOrderModal";
import Modal from "./Modal";
const BottomNav = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-13 mt-5 flex gap-2'>
      <button onClick={() => navigate("/")} className={`flex-1 flex items-center justify-center ${isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"} rounded-[20px]`} ><FaHome className="inline mr-2" size={30} /><p>Home</p></button>
      <button onClick={() => navigate("/orders")} className={`flex-1 flex items-center justify-center ${isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"} rounded-[20px]`} ><FaCartPlus className="inline mr-2" size={30} /><p>Orders</p></button>
      <button onClick={() => navigate("/products")} className={`flex-1 flex items-center justify-center ${isActive("/products") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"} rounded-[20px]`} ><MdTableBar className="inline mr-2" size={30} /><p>Products</p></button>
      {user.role === "admin" && (
        <button
          onClick={() => navigate("/more")}
          className={`flex-1 flex items-center justify-center ${isActive("/more")
              ? "text-[#f5f5f5] bg-[#343434]"
              : "text-[#ababab]"
            } rounded-[20px]`}
        >
          <MdMoreHoriz className="inline mr-2" size={30} />
          <p>More</p>
        </button>
      )}
      <button disabled={isActive("/tailors")} onClick={openModal} className="absolute left-1/2 -translate-x-1/2 -top-6 bg-[#f6b100] text-white rounded-full p-3 shadow-xl"><GiLoincloth size={35} /></button>
      <Modal isOpen={isModalOpen}>
        <CreateOrderModal isOpen={isModalOpen} onClose={closeModal} />
      </Modal>
    </div>
  )
}

export default BottomNav