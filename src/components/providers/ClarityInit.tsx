"use client";

import { useEffect } from "react";
import clarity from "@microsoft/clarity";

export default function ClarityInit() {
  useEffect(() => {
    try {
      clarity.init("x8rnrn451j");
    } catch (error) {
      console.error("Failed to initialize Microsoft Clarity", error);
    }
  }, []);

  return null;
}
