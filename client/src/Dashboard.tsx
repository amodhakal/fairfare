import { useEffect, useState, Suspense } from "react";
import { useNavigate } from "react-router";
import map from "./assets/map.png";
import { IoIosPin, IoIosStarOutline } from "react-icons/io";
import { FaCircleDot, FaStar } from "react-icons/fa6";
import { BiSolidTaxi } from "react-icons/bi";
import { PiScooter } from "react-icons/pi";

interface TransportOption {
  cost: number;
  rating: number;
  type: string;
  link?: string;
  rate?: number | string;
}

interface MicromobilityOption extends TransportOption {
  type: MicromobilityType;
  rate: number | string;
}


// Specific types for better type safety
type RideShareType = "taxi" | "uber" | "lyft";
type MicromobilityType =
  | "limescooter"
  | "limebike"
  | "birdscooter"
  | "spinscooter";

interface RideShareOption extends TransportOption {
  type: RideShareType;
  rate: number;
}

interface MicromobilityOption extends TransportOption {
  type: MicromobilityType;
  rate: number | string; // Rate is required for micromobility
}

interface RouteOptions {
  options: [
    RideShareOption[], // First array is always ride-share options
    MicromobilityOption[] // Second array is always micromobility options
  ];
}

type TransportationProp = {
  data: RideShareOption | MicromobilityOption;
  isLastItem: boolean;
};

function Transportation(props: TransportationProp) {
  const { data, isLastItem } = props;
  const maxStars = 5;
  const filledStars = Math.min(data.rating, maxStars);
  const emptyStars = maxStars - filledStars;

  const Icon = ["uber", "lyft", "taxi"].includes(data.type) ? (
    <BiSolidTaxi />
  ) : (
    <PiScooter />
  );

  const handleClick = () => {
    if (data.link) {
      window.open(
        data.link
          .replace(/^START/, "")
          .replace(/END$/, "")
          .trim()
      );
    }
  };

  return (
    <div
      className={`flex justify-between items-center p-4 bg-white hover:bg-gray-50 cursor-pointer ${
        data.link ? "" : "cursor-default"
      } ${isLastItem ? "" : "border-b"}`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-4">
        {/* Icon Section */}
        <div className="text-xl">{Icon}</div>

        {/* Rating and Type */}
        <div className="flex flex-col">
          <p className="text-lg font-medium capitalize">{data.type}</p>
          <div className="flex space-x-1">
            {/* Render Filled Stars */}
            {[...Array(filledStars)].map((_, i) => (
              <FaStar key={`filled-${i}`} className="text-black" />
            ))}
            {/* Render Empty Stars */}
            {[...Array(emptyStars)].map((_, i) => (
              <IoIosStarOutline key={`empty-${i}`} className="text-gray-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="text-lg font-semibold justify-end">${data.rate}</div>
    </div>
  );
}

function BottomPanel({ routeData }: { routeData?: RouteOptions | null }) {
  if (!routeData) {
    return (
      <div className="flex flex-col space-y-4 px-4">
        <h1 className="text-4xl font-black text-left mx-8">Fairfare</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mt-4"></div>
        </div>
      </div>
    );
  }

  const [first, second] = routeData.options;

  const actual = [
    ...first,
    ...second.map((item) => ({
      ...item,
      rate: item.cost.toFixed(2),
    })),
  ].sort(
    (a, b) => parseFloat(a.rate.toString()) - parseFloat(b.rate.toString())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <h1 className="font-black mb-2 text-4xl mx-8">Select an option</h1>
        {actual.map((data, index) => (
          <Transportation
            data={data}
            key={index}
            isLastItem={index === actual.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigateTo = useNavigate();

  useEffect(() => {
    const departureInput = localStorage.getItem("departure");
    const arrivalInput = localStorage.getItem("arrival");

    if (!departureInput || !arrivalInput) {
      navigateTo("/");
      return;
    }

    setDeparture(departureInput);
    setArrival(arrivalInput);
  }, [navigateTo]);

  useEffect(() => {
    if (departure && arrival) {
      setIsLoading(true);
      fetch(
        `/api/find/${encodeURIComponent(departure)}/${encodeURIComponent(
          arrival
        )}`
      )
        .then((data) => data.json())
        .then((res) => {
          setRouteData(res);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("API Error:", error);
          setIsLoading(false);
        });
    }
  }, [departure, arrival]);

  return (
    <div className="relative h-screen flex justify-center">
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `url(${map})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute top-4 w-80 p-4 bg-white rounded-3xl box-border shadow z-50 max-w-3xl flex items-center justify-between">
        <div className="">
          <div className="relative mb-4">
            <FaCircleDot className="absolute top-3 -translate-y-1/2 text-black text-xl pointer-events-none" />
            <p className="pl-8">{departure}</p>
          </div>
          <div className="relative">
            <IoIosPin className="absolute -left-1.5 top-3 -translate-y-1/2 text-red-500 text-3xl pointer-events-none" />
            <p className="pl-8">{arrival}</p>
          </div>
        </div>
        <button
          className="bg-gray-200 px-6 h-10 my-auto text-gray-500 border border-gray-200 rounded-3xl cursor-pointer active:bg-gray-100 active:border-gray-100"
          onClick={() => navigateTo("/")}
        >
          Edit
        </button>
      </div>
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl pt-8 pb-8 box-border shadow z-50 max-w-3xl h-3/5 flex flex-col">
        <Suspense fallback={<BottomPanel routeData={null} />}>
          <BottomPanel routeData={!isLoading ? routeData : null} />
        </Suspense>
      </div>
    </div>
  );
}
