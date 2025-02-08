import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import map from "./assets/map.png";
import { IoIosPin } from "react-icons/io";
import { FaCircleDot } from "react-icons/fa6";

export default function Dashboard() {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const navigateTo = useNavigate();

  useEffect(() => {
    const departureInput = localStorage.getItem("departure");
    const arrivalInput = localStorage.getItem("arrival");

    if (!departureInput || !arrivalInput) navigateTo("/");
    setDeparture(departureInput!);
    setArrival(arrivalInput!);

    // TODO: Handle getting information and displaying it
  }, [navigateTo, arrival, departure]);

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

      <div className="absolute top-4 w-80 bg-white rounded-3xl p-5 box-border shadow z-50 max-w-3xl flex items-cente justify-between">
        <div className="">
          <div className="relative mb-4">
            <FaCircleDot className="absolute top-3 -translate-y-1/2 text-black text-xl pointer-events-none" />
            <p className="pl-8">{ departure }</p>
          </div>
          <div className="relative">
            <IoIosPin className="absolute -left-1.5 top-3 -translate-y-1/2 text-red-500 text-3xl pointer-events-none" />
            <p className="pl-8">{ arrival }</p>
          </div>
        </div>
        <button
          className="bg-gray-200 px-6 h-10 my-auto text-gray-500 border border-gray-200 rounded-3xl cursor-pointer active:bg-gray-100 active:border-gray-100"
          onClick={() => navigateTo("/")}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
