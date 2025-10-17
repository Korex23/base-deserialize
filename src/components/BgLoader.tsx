// app/_components/BackgroundLoader.tsx (or wherever)
"use client";

import { useEffect, useState } from "react";
import PageLoader from "./general/PageLoader";

export default function BackgroundLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/images/bg.png";
    img.onload = () => setBgLoaded(true);
  }, []);

  if (!bgLoaded) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <PageLoader />
      </div>
    );
  }

  return <>{children}</>;
}
