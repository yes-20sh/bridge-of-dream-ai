"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, MapPin } from "lucide-react";

export function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobTitle, setJobTitle] = useState(searchParams.get("job_title") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (jobTitle.trim()) {
      params.set("job_title", jobTitle.trim());
    } else {
      params.delete("job_title");
    }
    
    if (location.trim()) {
      params.set("location", location.trim());
    } else {
      params.delete("location");
    }
    
    // reset page to 1 on new search
    params.delete("page");

    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row w-full shadow-[0px_4px_16px_rgba(0,0,0,0.04)] rounded-xl border border-zinc-100 p-1.5">
      <div className="flex-2 flex items-center relative border-b border-zinc-100 md:border-b-0 md:border-r px-3 py-2 md:py-0">
        <SearchIcon className="absolute left-3 h-4 w-4 text-zinc-400" />
        <Input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Job title or keywords"
          className="w-full border-0 focus-visible:ring-0 shadow-none pl-8 text-sm placeholder:text-zinc-400 h-10"
        />
      </div>
      <div className="flex-1 flex items-center relative border-b border-zinc-100 md:border-b-0 md:border-r px-3 py-2 md:py-0">
        <MapPin className="absolute left-3 h-4 w-4 text-zinc-400" />
        <Input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Location"
          className="w-full border-0 focus-visible:ring-0 shadow-none pl-8 text-sm placeholder:text-zinc-400 h-10"
        />
      </div>
      <div className="px-3 py-2 md:py-0 md:px-3 flex items-center">
        <Button 
          onClick={handleSearch}
          className="w-full md:w-auto rounded-lg px-8 text-sm font-semibold bg-black text-white hover:bg-zinc-800 h-10"
        >
          Search
        </Button>
      </div>
    </div>
  );
}
