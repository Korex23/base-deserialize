"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Montserrat_Alternates } from "next/font/google";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

const montserrat_alternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const Spotlight = () => {
  const [topEarner, setTopEarner] = useState("");
  const [close, setClose] = useState(false);

  useEffect(() => {
    const fetchTopEarner = async () => {
      try {
        const response = await fetch(
          "https://script.deserialize.xyz/api/highest-rank"
        );
        const data = await response.json();
        console.log(topEarner);

        setTopEarner(data.name); // Assuming the API returns an object with a 'name' property
      } catch (error) {
        console.error("Error fetching top earner:", error);
      }
    };
    fetchTopEarner();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClose(true);
    }, 600000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {!close && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          className={cn(
            "fixed bottom-6 spotlight right-3 z-50 w-[350px] h-[180px] border border-green-400 shadow-2xl rounded-2xl p-3 backdrop-blur-md",
            close ? "hidden" : "block"
          )}
        >
          <div className="relative">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setClose(true)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="ml-2 mb-2">
              <p
                className={cn(
                  "text-lg text-white",
                  montserrat_alternates.className
                )}
              >
                mariarodri16782.turbo
              </p>
              <p className="text-sm text-gray-200">
                Ranked 1st on the leaderboard last week.
              </p>
            </div>

            <div className="relative bg-[#0D0C0D99] w-[320px] h-[100px] rounded-md p-2 shadow-inner">
              <div className="absolute top-3 left-2">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_1485_2723)">
                    <path
                      d="M3.9555 7.875C4.73426 7.875 5.49554 8.10593 6.14306 8.53859C6.79058 8.97125 7.29526 9.5862 7.59328 10.3057C7.8913 11.0252 7.96927 11.8169 7.81734 12.5807C7.66541 13.3445 7.2904 14.0461 6.73973 14.5967C6.18906 15.1474 5.48747 15.5224 4.72367 15.6743C3.95987 15.8263 3.16817 15.7483 2.44868 15.4503C1.7292 15.1523 1.11425 14.6476 0.681588 14.0001C0.24893 13.3525 0.018 12.5913 0.018 11.8125L0 11.25C0 9.16142 0.829685 7.15838 2.30653 5.68153C3.78338 4.20469 5.78642 3.375 7.875 3.375V5.625C7.13599 5.62301 6.40392 5.76755 5.72111 6.05025C5.03831 6.33295 4.41832 6.7482 3.897 7.272C3.69435 7.47421 3.50743 7.69159 3.33787 7.92225C3.53962 7.89 3.74513 7.87388 3.95438 7.87388L3.9555 7.875ZM14.0805 7.875C14.8593 7.875 15.6205 8.10593 16.2681 8.53859C16.9156 8.97125 17.4203 9.5862 17.7183 10.3057C18.0163 11.0252 18.0943 11.8169 17.9423 12.5807C17.7904 13.3445 17.4154 14.0461 16.8647 14.5967C16.3141 15.1474 15.6125 15.5224 14.8487 15.6743C14.0849 15.8263 13.2932 15.7483 12.5737 15.4503C11.8542 15.1523 11.2392 14.6476 10.8066 14.0001C10.3739 13.3525 10.143 12.5913 10.143 11.8125L10.125 11.25C10.125 9.16142 10.9547 7.15838 12.4315 5.68153C13.9084 4.20469 15.9114 3.375 18 3.375V5.625C17.261 5.62301 16.5289 5.76755 15.8461 6.05025C15.1633 6.33295 14.5433 6.7482 14.022 7.272C13.8193 7.47421 13.6324 7.69159 13.4629 7.92225C13.6646 7.89 13.8705 7.875 14.0805 7.875Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1485_2723">
                      <rect width="18" height="18" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="ml-5">
                <p
                  className={cn(
                    "text-sm font-medium mb-1 text-white",
                    montserrat_alternates.className
                  )}
                >
                  Quote by mariarodri16782.turbo
                </p>
                <p
                  className={cn(
                    "italic text-xs text-gray-300",
                    montserrat_alternates.className
                  )}
                >
                  “In all heavens and earth, I am the chosen one.”
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Spotlight;
