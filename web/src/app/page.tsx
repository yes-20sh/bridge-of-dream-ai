import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  return (
    <div className="flex flex-col justify-center min-h-screen bg-white font-sans text-zinc-900 overflow-x-hidden">
      {/* Details Section */}
      <div className="max-w-6xl mx-auto w-full px-8 py-24 flex flex-col md:flex-row gap-20 justify-between items-start">
        {/* Left Column - Branding */}
        <div className="flex-1 max-w-xl">
          <p className="text-[22px] font-semibold mb-6 leading-tight text-zinc-900">
            Your AI
            <br />
            career partner,
          </p>
          <div className="relative inline-block mb-10">
            <h2 className="text-8xl md:text-[140px] font-bold tracking-tighter text-[#333333] leading-none mb-12 md:mb-20">
              Bridge of Dream
            </h2>
            <Image
              src="/no_file.gif"
              alt="Dream AI logo"
              width={144}
              height={144}
              className="w-28 h-28 md:w-36 md:h-36 rounded-lg absolute right-4 md:-right-1 bottom-[-68px] md:bottom-1 object-cover"
            />
          </div>
          <div className="mt-16 md:mt-24 max-w-lg">
            <p className="text-[17px] text-zinc-600 leading-relaxed font-medium">
              Streamline your job search with our platform, offering AI-driven
              personalized recommendations, real-time market insights, and a
              seamless path to your next big career move.
            </p>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="w-full md:w-80 pt-2 flex flex-col justify-between h-full min-h-[300px]">
          <div className="mb-24">
            <h4 className="font-bold text-zinc-900 text-[15px] mb-3">
              Project
            </h4>
            <div className="flex flex-col gap-1.5 text-[13px] font-medium text-zinc-500">
              <p>Project/Bridge of Dream AI</p>
              <p>Author/Yashraj Singh Solanki</p>
              <p>Date/2026</p>
            </div>
          </div>
          <div className="mt-auto">
            <p className="text-[20px] font-semibold text-zinc-900 leading-tight mb-8">
              We provide an extensive array of career opportunities curated by
              AI.
            </p>
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 md:static md:block md:z-auto">
              <Link href={token ? "/explore" : "/signin"}>
                <button className="px-8 py-3.5 bg-zinc-800 text-white font-medium text-[15px] hover:bg-zinc-800 transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:shadow-none">
                  {token ? "Explore more" : "Start Now"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
