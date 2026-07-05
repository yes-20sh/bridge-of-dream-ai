import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10 px-6 lg:px-12 flex flex-col justify-between overflow-hidden">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-8 flex flex-col">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-16">
              Do it once. Do it right.
            </h2>

            <div className="mb-12">
              <p className="text-sm text-zinc-400 mb-1">New Business:</p>
              <a
                href="mailto:hello@bridgeofdream.com"
                className="text-sm font-medium hover:underline"
              >
                hello@bridgeofdream.com
              </a>
            </div>

            <div className="max-w-md">
              <p className="text-sm text-zinc-400 mb-4">
                Sign up for our newsletter (No spam)
              </p>
              <div className="relative flex items-center">
                <Input
                  type="email"
                  placeholder="Email"
                  className="bg-transparent border-0 border-b border-zinc-700 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-white text-white placeholder:text-zinc-600 h-10 w-full"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-white hover:bg-transparent hover:text-zinc-300 p-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3">
            <Link
              href="/"
              className="text-sm hover:underline text-zinc-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/work"
              className="text-sm hover:underline text-zinc-300 hover:text-white transition-colors"
            >
              Work
            </Link>
            <Link
              href="/about"
              className="text-sm hover:underline text-zinc-300 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/services"
              className="text-sm hover:underline text-zinc-300 hover:text-white transition-colors"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="text-sm hover:underline text-zinc-300 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3">
            <Link
              href="https://instagram.com"
              target="_blank"
              className="text-sm hover:underline text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
            >
              Instagram <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              className="text-sm hover:underline text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
            >
              LinkedIn <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="w-full md:w-auto"></div>
          <div className="flex gap-16 text-sm text-zinc-400">
            <div className="flex flex-col">
              <span>San Diego—USA</span>
              <span>Paris—France</span>
            </div>
            <div className="flex flex-col">
              <span>Terms of use</span>
              <span>©13–26</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full text-center mt-12">
        <h1 className="text-[11vw] leading-none font-semibold tracking-tighter text-white whitespace-nowrap">
          BRIDGE OF DREAM
        </h1>
      </div>
    </footer>
  );
};
