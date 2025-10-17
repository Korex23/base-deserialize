"use client";

import { useEffect, useState } from "react";

interface CountdownLoaderProps {
  duration?: number;
  isFetching: boolean;
  resetTrigger: number;
  onClick: () => void;
}

export default function CountdownLoader({
  duration = 25,
  isFetching,
  resetTrigger,
  onClick,
}: CountdownLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isFetching) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 100 / duration));
    }, 1000);

    return () => clearInterval(interval);
  }, [isFetching, duration, resetTrigger]);

  const radius = 10;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-7 h-7" onClick={onClick}>
      <svg
        height="80%"
        width="80%"
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        className="rotate-[-90deg]"
      >
        <circle
          stroke="#E5E7EB"
          fill="none"
          strokeWidth={stroke}
          cx={radius}
          cy={radius}
          r={normalizedRadius}
        />
        <circle
          stroke={isFetching ? "#3b82f6" : "#0c2014"}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          className="transition-all duration-500 ease-out"
        />
      </svg>
    </div>
  );
}
