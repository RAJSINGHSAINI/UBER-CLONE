const VehicleCard = ({
    image,
    name,
    seats,
    time,
    price,
    selected,
    onClick
}) => {

    return (
        <button
            onClick={onClick}
            className={` w-full border lg:w-50 lg:max-h-41 rounded-2xl transition flex items-center gap-3 lg:flex-col lg:text-center lg:gap-2 lg: lg:hover:shadow-md
                ${selected
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:bg-gray-50"
                }
            `}
        >
            <img
                src={image}
                className="w-16 lg:w-20 mt-5 shrink-0 object-contain"
                alt="{name}"
            />

            <div className="flex-1 text-left lg:text-center">

                <h3 className="font-semibold text-base lg:text-sm">
                    {name}
                </h3>

                <div className="flex gap-3 mt-1 text-xs text-gray-500 lg:justify-center">

                    <span>
                        👤 {seats}
                    </span>

                    <span>
                        ⏱ {time}
                    </span>

                </div>

                <div className="mt-2 lg:mt-2 pt-2 lg:pt-2 border-t border-gray-200 lg:border-t">

                    <h2 className="font-bold text-lg lg:text-base">
                        ₹{price}
                    </h2>

                </div>

            </div>
        </button>
    );
};

export default VehicleCard;