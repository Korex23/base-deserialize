"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityProvider() {
  useEffect(() => {
    const projectId = "tub7wshima";
    Clarity.init(projectId);
  }, []);

  return null;
}
