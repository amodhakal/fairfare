import { motion } from "framer-motion";
import { IoIosPin } from "react-icons/io";
import { FaCircleDot } from "react-icons/fa6";
import { BiCurrentLocation } from "react-icons/bi";
import { TbLocationFilled } from "react-icons/tb";
import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router";

/*
 * Mock inputs
 * Departure - Hunt Library
 * Arrival - Talley Student Union
 */

export default function App() {
  const navigateTo = useNavigate();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const departureInput = localStorage.getItem("departure");
    const arrivalInput = localStorage.getItem("arrival");
    if (!departureInput || !arrivalInput) return;
    setDeparture(departureInput);
    setArrival(arrivalInput);
  }, []);

  if (isMobile) {
    return <MobileView departure={departure} arrival={arrival} setDeparture={setDeparture} setArrival={setArrival} handleSubmit={handleSubmit} />;
  }

  return <DesktopView departure={departure} arrival={arrival} setDeparture={setDeparture} setArrival={setArrival} handleSubmit={handleSubmit} />;

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    localStorage.setItem("departure", departure);
    localStorage.setItem("arrival", arrival);
    navigateTo("/dashboard");
  }
}

function MobileView({ departure, arrival, setDeparture, setArrival, handleSubmit }: {
  departure: string;
  arrival: string;
  setDeparture: (v: string) => void;
  setArrival: (v: string) => void;
  handleSubmit: (ev: FormEvent) => void;
}) {
  return (
    <div className="relative h-screen flex justify-center overflow-hidden bg-gray-900 lg:hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900" />
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_20s_linear_infinite]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: "backOut" }}>
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-red-500/40 blur-2xl -translate-x-1/2 -translate-y-1/2" />
            <TbLocationFilled className="text-red-500 text-5xl relative z-10 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] px-8 pt-10 pb-8 box-border shadow-2xl z-50 max-w-2xl"
      >
        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />

        <div className="mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Fairfare
          </h1>
          <p className="text-lg font-medium text-gray-500 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Where are you going today?
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center">
              <div className="absolute left-5 z-10 text-gray-400 group-focus-within:text-green-500 transition-colors">
                <FaCircleDot className="text-xl" />
              </div>
              <input
                type="text"
                placeholder="Departure Point"
                required
                className="relative w-full bg-gray-50/80 backdrop-blur-sm border-2 border-gray-100 rounded-3xl py-4 pl-14 pr-14 text-lg placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-300"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setDeparture("Hunt Library")}
                className="absolute right-5 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200"
              >
                <BiCurrentLocation className="text-2xl" />
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center">
              <div className="absolute left-4 z-10 text-red-500 group-focus-within:text-red-600 transition-colors">
                <IoIosPin className="text-2.5rem" />
              </div>
              <input
                type="text"
                placeholder="Arrival Point"
                required
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="relative w-full bg-gray-50/80 backdrop-blur-sm border-2 border-gray-100 rounded-3xl py-4 pl-14 pr-6 text-lg placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-3xl font-bold text-lg cursor-pointer shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 transition-all duration-300"
          >
            Find transportation
          </motion.button>
        </form>

        <div className="mt-6 flex justify-center gap-6 text-gray-400">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <FaCircleDot className="text-green-500 text-xs" />
            </div>
            <span>Real-time</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <IoIosPin className="text-blue-500 text-xs" />
            </div>
            <span>Multi-modal</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TbLocationFilled className="text-purple-500 text-xs" />
            </div>
            <span>Best prices</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DesktopView({ departure, arrival, setDeparture, setArrival, handleSubmit }: {
  departure: string;
  arrival: string;
  setDeparture: (v: string) => void;
  setArrival: (v: string) => void;
  handleSubmit: (ev: FormEvent) => void;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50 hidden lg:flex">
      <div className="w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_30s_linear_infinite]">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <div className="relative mb-8">
              <div className="w-40 h-40 rounded-full bg-red-500/30 blur-3xl absolute inset-0 -translate-x-1/2 -translate-y-1/2" />
              <TbLocationFilled className="text-red-500 text-8xl relative z-10 drop-shadow-2xl" />
            </div>
            <h1 className="text-7xl font-black mb-4">Fairfare</h1>
            <p className="text-2xl text-gray-300">Your journey, your way</p>
          </motion.div>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center p-16">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500 mb-8">Enter your destinations to find the best rides</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                <div className="relative">
                  <FaCircleDot className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    placeholder="Where are you starting?"
                    required
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-4 text-lg focus:outline-none focus:border-gray-300 focus:bg-white transition-all"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setDeparture("Hunt Library")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <BiCurrentLocation className="text-2xl" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <div className="relative">
                  <IoIosPin className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-3xl" />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    required
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-4 text-lg focus:outline-none focus:border-gray-300 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-2xl font-bold text-lg cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                Find transportation
              </motion.button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <FaCircleDot className="text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Real-time</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <IoIosPin className="text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Multi-modal</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-2">
                    <TbLocationFilled className="text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Best prices</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
