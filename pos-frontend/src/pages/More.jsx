import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import BackButton from "../components/shared/BackButton";
import { FaUserCheck } from "react-icons/fa";

const More = () => {

    const navigate = useNavigate();
    const adminFeatures = [
        {
            title: "User Approvals",
            description: "Approve or reject employee registrations",
            icon: <FaUserCheck className="text-white" size={24} />,
            path: "/user-approvals",
        },
    ];

    const user = useSelector(state => state.user);

    return (

        <div className="bg-[#252323] max-h-screen">

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <h1 className="text-3xl text-white font-bold mt-6 mb-8">More</h1>
                </div>
                {
                    user.role === "admin" ? (

                        <div className="space-y-4">

                            {adminFeatures.map((feature) => (

                                <button
                                    key={feature.title}
                                    onClick={() => navigate(feature.path)}
                                    className="w-full bg-[#1a1a1a] hover:bg-[#262626] rounded-lg p-5 flex items-center gap-4 transition"
                                >

                                    {feature.icon}

                                    <div className="text-left">

                                        <h2 className="text-white font-semibold">
                                            {feature.title}
                                        </h2>

                                        <p className="text-sm text-gray-200">
                                            {feature.description}
                                        </p>

                                    </div>

                                </button>

                            ))}

                        </div>

                    ) : (

                        <div className="text-center text-gray-400 mt-20">

                            No additional options available.

                        </div>

                    )
                }

            </div>

        </div>

    );

};

export default More;