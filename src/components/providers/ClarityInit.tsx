"use client";

import { useEffect, useRef } from "react";
import clarity from "@microsoft/clarity";
import { useSessionStore } from "@/store/useSessionStore";

export default function ClarityInit() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      try {
        clarity.init("x8rnrn451j");
        initialized.current = true;
      } catch (error) {
        console.error("Failed to initialize Microsoft Clarity", error);
      }
    }
  }, []);

  useEffect(() => {
    if (initialized.current && status === "authenticated" && session?.user?.email) {
      try {
        clarity.identify(session.user.email);
        clarity.setTag("is_logged_in", "true");
      } catch (error) {
        console.error("Failed to set user data in Microsoft Clarity", error);
      }
    }
  }, [session, status]);

  return null;
}
