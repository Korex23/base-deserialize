"use client";

import React from "react";
import { useParams } from "next/navigation";
import TokenDetails from "@/sections/TokenDetails";

const TokenDetailsPage = () => {
  const { token } = useParams();

  return <TokenDetails token={String(token)} />;
};

export default TokenDetailsPage;
