const SummaryCard = ({ title, value }) => {

    return (

        <div className="bg-[#1a1a1a] rounded-xl p-5">

            <p className="text-gray-400">

                {title}

            </p>

            <h1 className="text-4xl font-bold text-white mt-2">

                {value}

            </h1>

        </div>

    );

};

export default SummaryCard;