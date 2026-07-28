import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { register } from "../../https"
import { enqueueSnackbar } from "notistack" 
const Register = ({setIsRegister}) => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        registerMutation.mutate(formData)
    }

    const registerMutation = useMutation({
        mutationFn: (reqData) => register(reqData),
        onSuccess: (res) => {
            const { data } = res
            enqueueSnackbar(data.message, { variant: "success" })
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
            })
            setTimeout(()=>{
                setIsRegister()
            },1500)
        },
        onError: (error) => {
            const { response } = error
            enqueueSnackbar(response.data.message, { variant: "error" })
        }
    })


    return (
        <div >
            <form onSubmit={handleSubmit}>
                <div className="h-67 overflow-y-scroll scrollbar-none">
                    <div>
                        <label className="block text-[#ababab] mb-2 text-sm font-medium">Employee Name</label>
                        <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter employee name" required
                                className="bg-transparent flex-1 text-white focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[#ababab] mb-2 text-sm font-medium">Email</label>
                        <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter employee email id" required
                                className="bg-transparent flex-1 text-white focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[#ababab] mb-2 text-sm font-medium">Phone</label>
                        <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                            <input type="number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter employee phone number" required
                                className="bg-transparent flex-1 text-white focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[#ababab] mb-2 text-sm font-medium">Password</label>
                        <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" required
                                className="bg-transparent flex-1 text-white focus:outline-none" />
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold">
                    Sign up
                </button>
            </form>
        </div>
    )
}

export default Register
