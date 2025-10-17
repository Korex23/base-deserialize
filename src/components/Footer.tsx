"use client";

import { FaDiscord, FaXTwitter, FaHeadset } from "react-icons/fa6";
// import { BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full py-4 mt-8 border-t border-gray-700 text-center flex justify-center items-center gap-6">
      {/* 🔗 Social Links */}
      {/* <a
        href="https://docs.deserialize.xyz"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-blue-500 transition"
      >
        <BookOpen className="w-5 h-5" />
      </a> */}
      <a
        href="https://discord.gg/mbN7FGmXdF"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-blue-500 transition"
      >
        <FaDiscord className="w-5 h-5" />
      </a>
      <a
        href="https://x.com/Deserialize_?t=6bCaaFy0Jxko-h43Spn7eA&s=09"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-blue-400 transition"
      >
        <FaXTwitter className="w-5 h-5" />
      </a>
      <a
        href="https://discord.gg/mbN7FGmXdF"
        className="text-gray-400 hover:text-green-500 transition"
      >
        <FaHeadset className="w-5 h-5" />
      </a>
    </footer>
  );
};

export default Footer;
