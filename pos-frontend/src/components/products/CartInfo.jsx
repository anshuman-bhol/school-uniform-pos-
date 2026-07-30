import { RiDeleteBin5Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "../../redux/slices/cartSlice";
import { useEffect, useRef } from "react";
const CartInfo = () => {

    const cartData = useSelector(state => state.cart);
    const scrollRef = useRef();
    const dispatch = useDispatch();
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            })
        }
    }, [cartData]);
    const handleRemove = (itemId) => {
        dispatch(removeItem(itemId));
    }

    return (
        <div className="px-4 py-2 flex flex-col flex-1 min-h-0">
            <h1 className='text-lg text-[#e4e4e4] font-semibold tracking-wide'>Products</h1>
            <div ref={scrollRef} className="mt-4 flex-1 min-h-0 overflow-y-auto scrollbar-none">
                {
                    cartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-[#ababab] text-lg font-bold text-center">
                                No products added yet
                            </p>
                        </div>
                    ) : cartData.map((item) => {
                        return (
                            <div key={item.id} className="bg-[#1f1f1f] rounded-lg px-4 py-4 mb-2">
                                <div className='flex items-center justify-between'>
                                    <h1 className='text-[#ababab] font-semibold tracking-wide text-md'>{item.name}</h1>
                                    <p className='text-[#ababab] font-semibold'>x{item.quantity}</p>
                                </div>
                                <div className='flex items-center justify-between mt-3'>
                                    <div className='flex items-center gap-3'>
                                        <RiDeleteBin5Fill onClick={() => handleRemove(item.id)} className='text-[#ababab] cursor-pointer' size={20} />
                                        <FaNotesMedical className='text-[#ababab] cursor-pointer' size={20} />
                                    </div>
                                    <p className='text-[#f5f5f5] text-md font-bold'>{
                                        item.customPrice ? (
                                            <span className="text-blue-400 font-medium">
                                                Price at Billing
                                            </span>
                                        ) : (
                                            <span className="text-green-400 font-medium">
                                                ₹{item.pricePerQuantity}
                                            </span>
                                        )
                                    }</p>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    )
}

export default CartInfo
