"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Announcement {
  announcement: string;
  href: string;
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
  speed?: number;
  gap?: number;
}

const defaultAnnouncements = [
  {
    announcement: "Deserialize secret points? 👀",
    href: "https://points.deserialize.xyz",
  },
  {
    announcement: "🎉 Deserialize Eclipse Boost Is Live!",
    href: "https://tap.eclipse.xyz/",
  },
];

const AnnouncementBanner = ({
  announcements = defaultAnnouncements,
  speed = 20,
  gap = 500,
}: AnnouncementBannerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (announcements.length === 0) return;

    // Reset position when we've scrolled through the first set of announcements
    const handleAnimation = () => {
      if (containerRef.current) {
        setContentWidth(containerRef.current.scrollWidth / 2);
      }

      setPosition((prev) => {
        if (Math.abs(prev) >= contentWidth && contentWidth > 0) {
          return 0; // Reset to beginning when reaching the end of first copy
        }
        return prev - 1;
      });
    };

    const interval = setInterval(handleAnimation, speed);

    // Initial measurement
    if (containerRef.current) {
      setContentWidth(containerRef.current.scrollWidth / 2);
    }

    return () => clearInterval(interval);
  }, [announcements, speed, contentWidth]);

  if (announcements.length === 0) return null;

  return (
    <div
      className={cn(
        "w-full border-t border-zinc-800 py-1.5 overflow-hidden relative",
        "bg-zinc-950 text-green-200 text-sm"
      )}
    >
      <div
        ref={containerRef}
        className="whitespace-nowrap text-sm font-medium px-4"
        style={{
          transform: `translateX(${position}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        {/* First copy of announcements */}
        {announcements.map((announcement, index) => (
          <Link href={announcement.href} key={`first-${index}`}>
            <span className="inline-block" style={{ marginRight: `${gap}px` }}>
              {announcement.announcement}
            </span>
          </Link>
        ))}

        {/* Second copy to create the loop */}
        {announcements.map((announcement, index) => (
          <Link href={announcement.href} key={`second-${index}`}>
            <span className="inline-block" style={{ marginRight: `${gap}px` }}>
              {announcement.announcement}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBanner;
