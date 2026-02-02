import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { IoIosPin } from "react-icons/io";
import { FaCircleDot, FaArrowLeft } from "react-icons/fa6";
import { BiSolidTaxi } from "react-icons/bi";
import { PiScooter } from "react-icons/pi";
import { RiStarSFill } from "react-icons/ri";
import { motion } from "framer-motion";

interface TransportOption {
  cost: number;
  rating: number;
  type: string;
  link?: string;
  rate?: number | string;
}

type RideShareType = "taxi" | "uber" | "lyft";
type MicromobilityType = "limescooter" | "limebike" | "birdscooter" | "spinscooter";

interface RideShareOption extends TransportOption {
  type: RideShareType;
  rate: number | string;
}

interface MicromobilityOption extends TransportOption {
  type: MicromobilityType;
  rate: number | string;
}

interface RouteOptions {
  options: [RideShareOption[], MicromobilityOption[]];
}

type TransportationProp = {
  data: RideShareOption | MicromobilityOption;
  isLastItem: boolean;
};

function Transportation({ data, isLastItem }: TransportationProp) {
  const maxStars = 5;
  const filledStars = Math.max(1, Math.min(data.rating, maxStars));

  const isRideShare = ["uber", "lyft", "taxi"].includes(data.type);

  const handleClick = () => {
    if (data.link) {
      window.open(data.link.replace(/^START/, "").replace(/END$/, "").trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between p-5 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${isLastItem ? "" : "border-b border-gray-100"} ${data.link ? "" : "cursor-default"}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
          {isRideShare ? <BiSolidTaxi className="text-2xl text-gray-700" /> : <PiScooter className="text-2xl text-gray-700" />}
        </div>
        <div>
          <p className="text-lg font-semibold capitalize text-gray-900">{data.type}</p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(filledStars)].map((_, i) => (
              <RiStarSFill key={i} className="text-yellow-400 text-sm" />
            ))}
            <span className="text-sm text-gray-400 ml-1">{data.rating}</span>
          </div>
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900">${data.rate}</div>
    </motion.div>
  );
}

function MobileBottomPanel({ routeData, isLoading }: { routeData: RouteOptions | null; isLoading: boolean }) {
  if (isLoading || !routeData) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full mb-4" />
        <p className="text-gray-500">Finding the best options...</p>
      </div>
    );
  }

  const [first, second] = routeData.options;
  const actual = [...first, ...second]
    .map((item) => ({ ...item, rate: item.cost.toFixed(2) }))
    .sort((a, b) => parseFloat(b.rating.toString()) - parseFloat(a.rating.toString()));

  return (
    <div className="h-full flex flex-col">
      <h1 className="font-black text-4xl mb-1">Results</h1>
      <p className="text-xs text-gray-400 mb-4">Prices are estimates, may not include taxes or fees</p>
      <div className="flex-1 overflow-y-auto -mx-6 px-6">
        {actual.map((data, index) => (
          <Transportation data={data} key={index} isLastItem={index === actual.length - 1} />
        ))}
      </div>
    </div>
  );
}

function DesktopResults({ routeData, isLoading }: { routeData: RouteOptions | null; isLoading: boolean }) {
  if (isLoading || !routeData) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-3xl shadow-xl p-10">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full mb-6" />
        <p className="text-gray-500 text-lg">Finding the best transportation options...</p>
      </div>
    );
  }

  const [first, second] = routeData.options;
  const actual = [...first, ...second]
    .map((item) => ({ ...item, rate: item.cost.toFixed(2) }))
    .sort((a, b) => parseFloat(b.rating.toString()) - parseFloat(a.rating.toString()));

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gray-900 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FaCircleDot className="text-green-400" />
          <span className="font-medium">{localStorage.getItem("departure")}</span>
        </div>
        <div className="flex items-center gap-3">
          <IoIosPin className="text-red-400" />
          <span className="font-medium">{localStorage.getItem("arrival")}</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {actual.map((data, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer transition-colors ${data.link ? "" : "cursor-default"}`}
            onClick={() => data.link && window.open(data.link.replace(/^START/, "").replace(/END$/, "").trim())}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                {["uber", "lyft", "taxi"].includes(data.type) ? <BiSolidTaxi className="text-2xl text-gray-700" /> : <PiScooter className="text-2xl text-gray-700" />}
              </div>
              <div>
                <p className="text-lg font-semibold capitalize text-gray-900">{data.type}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(Math.max(1, Math.min(data.rating, 5)))].map((_, i) => (
                    <RiStarSFill key={i} className="text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-400 ml-1">{data.rating}</span>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">${data.rate}</div>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-gray-400 p-4 text-center bg-gray-50">Prices are estimates and may not include taxes or app fees</p>
    </div>
  );
}

export default function Dashboard() {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [routeData, setRouteData] = useState<RouteOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigateTo = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      fetch(`/api/find/${encodeURIComponent(departure)}/${encodeURIComponent(arrival)}`)
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

  if (isMobile) {
    return (
      <div className="relative h-screen flex justify-center overflow-hidden bg-gray-900 lg:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_20s_linear_infinite]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl" />
        </div>

        <div className="absolute top-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl z-50">
          <button onClick={() => navigateTo("/")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3">
            <FaArrowLeft />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700 font-medium truncate">{departure}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-700 font-medium truncate">{arrival}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] pt-8 pb-6 px-6 box-border shadow-2xl z-50 max-w-2xl h-3/5 flex flex-col">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
          <MobileBottomPanel routeData={!isLoading ? routeData : null} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100 hidden lg:flex">
      <div className="w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_30s_linear_infinite]">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gray-900/50" />
        
        <div className="absolute top-8 left-8">
          <button onClick={() => navigateTo("/")} className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white hover:bg-white/30 transition-colors">
            <FaArrowLeft />
            <span className="font-medium">New Search</span>
          </button>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">From</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xl font-semibold text-gray-900">{departure}</span>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">To</h3>
                <div className="flex items-center justify-end gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xl font-semibold text-gray-900">{arrival}</span>
                </div>
              </div>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Transportation options</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{routeData ? routeData.options[0].length + routeData.options[1].length : 0}</p>
              </div>
              <div className="flex -space-x-3">
                {routeData?.options[0].slice(0, 4).map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 p-10 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Transportation Options</h1>
          <p className="text-gray-500 mb-8">Compare prices and ratings across all providers</p>
          <DesktopResults routeData={routeData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
