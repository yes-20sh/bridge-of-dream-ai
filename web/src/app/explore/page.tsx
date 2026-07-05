import React, { Suspense } from "react";
import { Search } from "@/components/Search/Search";
import { JobSearchApiContainer } from "@/api/JobSearchApiContainer/JobSearchApiContainer";
import { JobsApiContainer } from "@/api/JobsApiContainer/JobsApiContainer";
import { JobFilterShimmer } from "@/components/JobFilter/JobFilterShimmer";
import { JobListShimmer } from "@/components/JobList/JobListShimmer";

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
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-zinc-100 rounded-lg" />}>
            <Search />
          </Suspense>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 lg:px-12 py-10 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-10 shrink-0">
          {/* Filters */}
          <Suspense fallback={<JobFilterShimmer />}>
            <JobSearchApiContainer />
          </Suspense>
        </div>

        {/* Main Job List */}
        <div className="flex-1">
          <Suspense fallback={<JobListShimmer />}>
            <JobsApiContainer searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
