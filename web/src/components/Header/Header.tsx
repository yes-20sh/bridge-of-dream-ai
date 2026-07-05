"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOGO } from "../../../public/logo";
import axios from "axios";
import { getHeaderMetrics, HeaderMetricsResponse } from "@/api/GeneralApi/getHeaderMetrics";
import { logoutUser } from "@/api/UserApi/logout";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [metrics, setMetrics] = React.useState<HeaderMetricsResponse>({ network: 0, applied: 0, saved: 0 });

  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getHeaderMetrics();
        setMetrics(data);
      } catch (err) {
        // If it's a 401 Unauthorized, the user simply isn't logged in yet.
        if (axios.isAxiosError(err)) {
          if (err.response?.status !== 401) {
            console.error("Failed to fetch header metrics", err);
          }
        } else {
          console.error("Failed to fetch header metrics", err);
        }
      }
    };
    fetchMetrics();
  }, [pathname]);
  
  const isJobs = pathname === "/explore" || pathname.startsWith("/jobs");
  const isNetwork = pathname.startsWith("/network");
  const isSaved = pathname.startsWith("/saved");
  const isApplied = pathname.startsWith("/applied");

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200">
      <div className="container mx-auto flex h-[72px] items-center justify-between px-6 lg:px-12">
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/explore"
            className="flex items-center justify-center rounded-full overflow-hidden shrink-0"
          >
            <Image
              src={LOGO.logo2}
              alt="Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-medium text-[15px]">
            <Link
              href="/explore"
              className={`transition-colors ${
                isJobs
                  ? "text-black font-bold border-b-2 border-black pb-1 translate-y-[2px]"
                  : "text-zinc-500 hover:text-black"
              }`}
            >
              Jobs
            </Link>

            <Link
              href="/network"
              className={`transition-colors ${
                isNetwork
                  ? "text-black font-bold border-b-2 border-black pb-1 translate-y-[2px]"
                  : "text-zinc-500 hover:text-black"
              }`}
            >
              Network {metrics.network > 0 && `(${metrics.network})`}
            </Link>
          </nav>
        </div>

        {/* Right Side: Links & Avatar */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-[14px] font-medium">
            <Link
              href="/saved"
              className={`transition-colors ${
                isSaved ? "text-black font-bold" : "text-zinc-500 hover:text-black"
              }`}
            >
              Saved ({metrics.saved})
            </Link>
            <Link
              href="/applied"
              className={`relative transition-colors ${
                isApplied ? "text-black font-bold" : "text-zinc-500 hover:text-black"
              }`}
            >
              Applied ({metrics.applied})
              {metrics.applied > 0 && <span className="absolute -top-1 -right-2 w-2 h-2 bg-blue-600 rounded-full"></span>}
            </Link>
            <Link href="/help" className="text-zinc-500 hover:text-black transition-colors">
              Help
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="outline-none border-none bg-transparent p-0 cursor-pointer" />}>
              <Avatar className="h-10 w-10 border border-zinc-200 cursor-pointer bg-blue-50/50 outline-none">
                <AvatarImage
                  src={LOGO.avtar.src}
                  alt="User Illustration"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => router.push("/account")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={async () => {
                  try {
                    await logoutUser();
                  } catch (error) {
                    console.error("Logout failed:", error);
                  } finally {
                    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.location.href = "/";
                  }
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
