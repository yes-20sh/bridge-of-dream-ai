"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { axiosInstance } from "@/api/axiosInstance";

export const NavigationWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/signin") || pathname?.startsWith("/request") || pathname?.startsWith("/forgot-password");
  const isHomePage = pathname === "/";
  const hideNavigation = isAuthPage || isHomePage;

  useEffect(() => {
    const pingBackend = async () => {
      try {
        await axiosInstance.get("/general/cron");
      } catch (err) {
        console.error("Cron ping failed:", err);
      }
    };

    // Ping on mount
    pingBackend();

    // Ping every 15 minutes (15 * 60 * 1000)
    const interval = setInterval(pingBackend, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {!hideNavigation && <Header />}
      <main className="flex-1 flex flex-col">{children}</main>
      {!hideNavigation && <Footer />}
    </>
  );
};
