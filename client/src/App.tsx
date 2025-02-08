import map from "./assets/map.png";
import { IoIosPin } from "react-icons/io";
import { FaCircleDot } from "react-icons/fa6";
import { BiCurrentLocation } from "react-icons/bi";
import { TbLocationFilled } from "react-icons/tb";
import { useState } from "react";

const App = () => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");

  return (
    <div className="relative h-screen flex justify-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <div className="absolute w-32 h-32 rounded-full bg-red-500 opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
          <TbLocationFilled className="text-red-700 text-4xl relative z-10 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div
        className="w-full h-full"
        style={{
          backgroundImage: `url(${map})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl px-8 pt-8 box-border shadow-xl z-50 max-w-3xl ">
        <h1 className="text-4xl font-black text-left">Fairfare</h1>
        <h2 className="text-md font-bold text-left mb-3 mt-1 text-red-500">
          Where are you going today?
        </h2>

        <form className="flex flex-col py-4">
          <div className="relative mb-2">
            <FaCircleDot className="absolute left-3.5 top-5.5 -translate-y-1/2 text-black text-xl pointer-events-none" />
            <input
              type="text"
              placeholder="Departure Point"
              required
              className="border border-gray-200 bg-gray-100 w-full rounded-3xl py-2 px-12 mb-2"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
            />
            <BiCurrentLocation
              onClick={() => setDeparture("Hunt Library")}
              className="absolute right-3.5 top-5.5 -translate-y-1/2 text-black text-2xl cursor-pointer"
            />
          </div>

          <div className="relative mb-2">
            <IoIosPin className="absolute left-2.5 top-5.5 -translate-y-1/2 text-red-500 text-3xl pointer-events-none" />
            <input
              type="text"
              placeholder="Arrival Point"
              required
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="border border-gray-200 bg-gray-100 w-full rounded-3xl py-2 px-12 mb-2"
            />
          </div>

          <button className="bg-black text-white p-4 rounded-3xl font-bold">
            Find transportation
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
