import BottomNav from '../components/shared/BottomNav'
import CustomerInfo from '../components/products/CustomerInfo';
import CartInfo from '../components/products/CartInfo';
import Bill from '../components/products/Bill';
import BackButton from '../components/shared/BackButton';
import { GiTripleNeedle } from "react-icons/gi";
import ProductsContainer from '../components/products/ProductContainer';
import { useSelector } from 'react-redux';
const Products = () => {

    const customerData = useSelector(state => state.customer);

    return (
        <section className="bg-[#1f1f1f] h-full overflow-hidden flex gap-3 relative">
            <div className="flex-3 flex flex-col min-h-0">
                <div className="flex items-center justify-between px-10 py-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-[#f5f5f5] text-xl font-bold tracking-wide">Products</h1>
                    </div>
                    <div className="flex items-center justify-around gap-4">
                        <div className='flex items-center gap-3 cursor-pointer'>
                            <GiTripleNeedle className='text-white text-4xl' />
                            <div className='flex flex-col items-start'>
                                <h1 className='text-md text-white font-semibold'>{customerData.customerName || 'Customer Name'}</h1>
                                <p className='text-xs text-gray-400 font-medium'>Tailor : {customerData.tailor?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-h-0 mb-20">
                    <ProductsContainer />
                </div>
            </div>
            <div className="flex-1 min-h-0 mb-20 overflow-hidden">
                <div className="bg-[#1a1a1a] mt-2 mr-3 h-full rounded-lg pt-2 flex flex-col">
                    <CustomerInfo />
                    <hr className='border-[#2a2a2a] border-t-2' />
                    <CartInfo />
                    <hr className='border-[#2a2a2a] border-t-2' />
                    <Bill />
                </div>
            </div>
            <BottomNav />
        </section>
    )
}

export default Products
