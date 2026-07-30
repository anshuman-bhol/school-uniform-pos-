import { FaSearch } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { RiDashboardFill } from "react-icons/ri";
import logo from "../../assets/images/header.png"
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { TbLogout } from "react-icons/tb";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
const Header = () => {

    const navigate = useNavigate()
    const userData = useSelector(state => state.user)
    const dispatch = useDispatch()
    const logoutMutation = useMutation({
        mutationFn: () => logout(),
        onSuccess: (data) => {
            console.log(data)
            dispatch(removeUser())
            navigate("/auth")
        },
        onError: (error) => {
            console.log(error)
        }
    })
    const handleLogout = () => {
        logoutMutation.mutate()
    }

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-black shrink-0">
            <div onClick={() => navigate("/")} className='flex items-center gap-2 cursor-pointer'>
                <img src={logo} className="h-8 w-8 " alt="restro logo" />
                <h1 className='text-lg font-semibold text-white'>Clothing</h1>
            </div>

            <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[20px] px-5 py-2">
                <FaSearch className='text-[#f5f5f5]' />
                <input
                    type="text"
                    placeholder="Search"
                    className='bg-[#333] outline-none text-white px-2 py-1 rounded-[5px]'
                />
            </div>

            <div className='flex items-center gap-4'>
                {userData.role === "admin" && (
                    <div onClick={() => navigate("/dashboard")} className='bg-black rounded-[15px] p-2 cursor-pointer'>
                        <RiDashboardFill className='text-white text-2xl' />
                    </div>
                )}
                <div className='bg-black rounded-[15px] p-2 cursor-pointer'>
                    <FaBell className='text-white text-2xl' />
                </div>
                <div className='flex items-center gap-3 cursor-pointer'>
                    <FaUserCircle className='text-white text-4xl' />
                    <div className='flex flex-col items-start'>
                        <h1 className='text-md text-white font-semibold'>{userData.name || "TEST USER"}</h1>
                        <p className='text-xs text-gray-400 font-medium'>{userData.role || "Role"}</p>
                    </div>
                    <TbLogout onClick={handleLogout} className="text-[#f5f5f5] ml-2" size={25} />
                </div>
            </div>
        </header>
    );
};

export default Header;
