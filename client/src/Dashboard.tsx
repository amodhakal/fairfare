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
    // Get values from localStorage
    const departureInput = localStorage.getItem("departure");
    const arrivalInput = localStorage.getItem("arrival");

    // Redirect if values don't exist
    if (!departureInput || !arrivalInput) {
      navigateTo("/");
      return;
    }

    // Set state values
    setDeparture(departureInput!);
    setArrival(arrivalInput!);
  }, []); // Only run on mount

  // Separate useEffect for API call
  useEffect(() => {
    // Only make the API call if both values exist
    if (departure && arrival) {
      fetch(
        `/api/find/${encodeURIComponent(departure)}/${encodeURIComponent(
          arrival
        )}`
      )
        .then((data) => data.json().then(res => console.log(res)))
        .catch((error) => {
          console.error("API Error:", error);
        });
    }
  }, [departure, arrival]); // Run when departure or arrival change

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
      <div className="absolute top-4 w-80 bg-white rounded-3xl p-5 box-border shadow z-50 max-w-3xl flex items-center justify-between">
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
    </div>
  );
}
