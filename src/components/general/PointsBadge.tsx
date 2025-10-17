"use client";

import { Button } from "../ui/button";
import { IoIosFlame } from "react-icons/io";
import Link from "next/link";

const PointsBadge = () => {
  return (
    <Button className="h-fit px-2 py-1.5 md:pr-4 gap-2" variant="secondary">
      <Link href={"https://points.deserialize.xyz/"}>
        <span
          className={`size-7 rounded-full bg-[#849f91] flex items-center justify-center text-[18px] text-green-300 drop-shadow-[0_0_4px_#85eeab]`}
        >
          <IoIosFlame className="text-current" />
        </span>
      </Link>
      <div className="flex flex-col items-start text-xs text-gray-500">
        <span className="font-semibold">
          10,000
          <span className="lg:visible invisible hidden lg:inline-block">
            Points
          </span>
        </span>
      </div>
    </Button>
  );
};

export default PointsBadge;
