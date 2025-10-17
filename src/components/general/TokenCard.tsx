import { cn } from "@/lib/utils";
import React from "react";

const TokenCard = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={cn(
        "mx-auto max-w-[32rem] w-full sm:p-4 p-3 md:p-6 rounded-xl bg-[#0B2E0466] border-[0.2px] border-[#6D9765] relative overflow-hidden",
        props.className
      )}
    >
      {/* Glowing effect */}
      <div className="absolute z-[-1] top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#00FF66] to-transparent rounded-full blur-3xl pointer-events-none" />

      {props.children}
    </div>
  );
};

export default TokenCard;
