import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href="/">
      <Image
        src="/images/logo.png"
        alt="logo"
        width={38}
        height={28}
        className="rounded-full object-cover w-auto h-auto"
        priority
      />
    </Link>
  );
};

export default Logo;
