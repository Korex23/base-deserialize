"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";

interface TabListProps {
  tabs: { label: string; href: string; status?: "active" | "inactive" }[];
}

const TabList: React.FC<TabListProps> = ({ tabs }) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="max-w-[32rem] mx-auto">
      <div className="grid grid-cols-2 gap-2 mb-6 border-gray-700">
        {tabs.map(({ label, href, status }) => {
          const isActive = pathname === href;
          const isInactive = status === "inactive";

          return (
            <div key={label} className="relative group">
              <Link href={href}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  disabled={isInactive}
                  style={{
                    color: isActive ? "white" : "white",
                  }}
                  className="text-[14px] w-full cursor-pointer disabled:opacity-100 disabled:grayscale-0 disabled:text-white disabled:cursor-not-allowed"
                >
                  {label}
                </Button>
              </Link>

              {isInactive && (
                <div
                  className="absolute border-[#262626] border rounded-full inset-0 bg-black flex items-center justify-center 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                  <span className="text-white text-sm font-medium">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TabList;
