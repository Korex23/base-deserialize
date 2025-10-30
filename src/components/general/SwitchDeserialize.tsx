"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DeserializeType {
  name: string;
  image: string;
  link: string;
}

const deserializeLinks: DeserializeType[] = [
  // {
  //   name: "Eclipse",
  //   image: "/images/eclipse.png",
  //   link: "https://deserialize.xyz",
  // },
  {
    name: "Base",
    image: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
    link: "https://base.deserialize.xyz",
  },
  {
    name: "0G",
    image: "/tokens/0glogo.jpg",
    link: "https://0g.deserialize.xyz",
  },
];

const SwitchDeserialize = () => {
  const [selectedLink, setSelectedLink] = useState<DeserializeType | null>(
    null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const selectLink = deserializeLinks.find((link) => link.name === "Base");
    if (selectLink) {
      setSelectedLink(selectLink);
    }
  }, []);
  return (
    <>
      <div>
        <div
          className="flex gap-2 rounded-full px-3 py-2 cursor-pointer select-none relative items-center border border-[#262626] bg-[#0b0b0b] shadow-sm enabled:hover:bg-[#262626] enabled:hover:text-accent-foreground"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div>
            {selectedLink && (
              <div className="flex items-center gap-2">
                <img
                  src={selectedLink.image}
                  alt={selectedLink.name}
                  className="w-7 h-7 rounded-full"
                />
                <span className="text-lg font-medium text-white md:block hidden">
                  {selectedLink.name}
                </span>
              </div>
            )}
          </div>
          <div className="text-[10px] rounded-full">
            {dropdownOpen ? (
              <ChevronUp size={15} className="text-zinc-400" />
            ) : (
              <ChevronDown size={15} className="text-zinc-400" />
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute top-12 left-0 w-max bg-[#0b0b0b] border border-[#262626] rounded-xl shadow-lg z-50">
              {deserializeLinks.map((link) => (
                <div
                  key={link.name}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#262626] rounded-xl"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (link.name !== "Base") {
                      window.open(link.link, "_self");
                    }
                  }}
                >
                  <img
                    src={link.image}
                    alt={link.name}
                    className="w-7 h-7 rounded-full"
                  />
                  <span className="text-lg font-medium text-white">
                    {link.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SwitchDeserialize;
