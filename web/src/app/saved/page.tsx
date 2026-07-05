import React, { Suspense } from "react";
import { JobListShimmer } from "@/components/JobList/JobList";
import { SavedJobsContainer } from "@/components/SavedJobsContainer/SavedJobsContainer";

export default function SavedPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-zinc-100 bg-zinc-50/30">
        <div className="container mx-auto px-6 lg:px-12 py-10">
          <h1 className="text-3xl font-bold text-zinc-900">Saved Jobs</h1>
          <p className="text-zinc-500 mt-2">Manage and review the jobs you have bookmarked.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 lg:px-12 py-10">
        <div className="w-full">
          <Suspense fallback={<JobListShimmer />}>
            <SavedJobsContainer searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
