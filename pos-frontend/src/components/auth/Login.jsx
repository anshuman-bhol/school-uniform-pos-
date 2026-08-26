import { useMutation } from "@tanstack/react-query"
import { ACCESS_TOKEN_KEY, login, sendOtp, verifyOtp } from "../../https/index"
import { useState } from "react"
import { enqueueSnackbar } from "notistack"
import { useDispatch } from "react-redux"
import { setUser } from "../../redux/slices/userSlice"
import { useNavigate } from "react-router-dom"

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [loginMode, setLoginMode] = useState("password");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (loginMode === "password") {
            loginMutation.mutate(formData);
            return;
        }

        if (!otpSent) {
            sendOtpMutation.mutate(formData.email);
            return;
        }

        verifyOtpMutation.mutate({
            email: formData.email,
            otp,
        });
    };

    const loginMutation = useMutation({
        mutationFn: (reqData) => login(reqData),
        onSuccess: (res) => {
            const { data } = res
            console.log(data)
            const { _id, name, email, phone, role } = data.data
            localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
            dispatch(setUser({ _id, name, email, phone, role }))
            navigate("/")
        },
        onError: (error) => {
            const { response } = error
            enqueueSnackbar(response.data.message, { variant: "error" })
        }
    })

    const sendOtpMutation = useMutation({
        mutationFn: (email) => sendOtp({ email }),

        onSuccess: () => {
            enqueueSnackbar("OTP sent successfully.", {
                variant: "success",
            });

            setOtpSent(true);
        },

        onError: (error) => {
            enqueueSnackbar(
                error.response?.data?.message || "Unable to send OTP.",
                {
                    variant: "error",
                }
            );
        },
    });

    const verifyOtpMutation = useMutation({
        mutationFn: (data) => verifyOtp(data),

        onSuccess: (res) => {
            const { _id, name, email, phone, role } = res.data.data;

            localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);

            dispatch(
                setUser({
                    _id,
                    name,
                    email,
                    phone,
                    role,
                })
            );

            enqueueSnackbar("Login Successful", {
                variant: "success",
            });

            navigate("/");
        },

        onError: (error) => {
            enqueueSnackbar(
                error.response?.data?.message || "Invalid OTP",
                {
                    variant: "error",
                }
            );
        },
    });

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label className="block text-[#ababab] mb-2 text-sm font-medium">Email</label>
                    <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                        <input type="email" readOnly={otpSent} name="email" value={formData.email} onChange={handleChange} placeholder="Enter employee email id" required
                            className="bg-transparent flex-1 text-white focus:outline-none" />
                    </div>
                </div>
                {loginMode === "password" ? (
                    <div>
                        <label className="block text-[#ababab] mb-2 text-sm font-medium">
                            Password
                        </label>

                        <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                required={loginMode === "password"}
                                className="bg-transparent flex-1 text-white focus:outline-none"
                            />
                        </div>
                    </div>
                ) : (
                    otpSent && (
                        <div>
                            <label className="block text-[#ababab] mb-2 text-sm font-medium">
                                OTP
                            </label>

                            <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    required
                                    className="bg-transparent flex-1 text-white focus:outline-none"
                                />
                            </div>
                        </div>
                    )
                )}
                <button
                    type="submit"
                    className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
                >
                    {loginMode === "password"
                        ? "Sign In"
                        : otpSent
                            ? "Verify OTP"
                            : "Send OTP"}
                </button>
                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-[#333]"></div>

                    <span className="px-4 text-[#888] text-sm">
                        OR
                    </span>

                    <div className="flex-1 h-px bg-[#333]"></div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setLoginMode(
                            loginMode === "password"
                                ? "otp"
                                : "password"
                        );

                        setOtpSent(false);
                        setOtp("");
                    }}
                    className="w-full rounded-lg py-3 border border-yellow-400 text-yellow-400 font-semibold hover:bg-yellow-400 hover:text-[#1a1a1a] transition-all"
                >
                    {loginMode === "password"
                        ? "Login with OTP"
                        : "Login with Password"}
                </button>
            </form>
        </div>
    )
}

export default Login
