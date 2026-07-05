import React, { Suspense } from "react";
import { Search } from "@/components/Search/Search";
import { JobSearchApiContainer } from "@/api/JobSearchApiContainer/JobSearchApiContainer";
import { JobsApiContainer } from "@/api/JobsApiContainer/JobsApiContainer";
import { Loader2 } from "lucide-react";

export default async function Explore({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Search Header Section */}
      <div className="border-b border-zinc-100">
        <div className="container mx-auto px-6 lg:px-12 py-6">
          <Search />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 lg:px-12 py-10 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-10 shrink-0">
          {/* Filters */}
          <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>}>
            <JobSearchApiContainer />
          </Suspense>
        </div>

        {/* Main Job List */}
        <div className="flex-1">
          <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>}>
            <JobsApiContainer searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
