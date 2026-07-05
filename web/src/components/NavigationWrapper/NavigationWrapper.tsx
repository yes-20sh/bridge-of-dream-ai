"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";

export const NavigationWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/signin") || pathname?.startsWith("/request");

  return (
    <>
      {!isAuthPage && <Header />}
      <main className="flex-1 flex flex-col">{children}</main>
      {!isAuthPage && <Footer />}
    </>
  );
};
