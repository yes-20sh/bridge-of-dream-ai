"use client";

import React, { useEffect, useState } from "react";
import { JobList, Job } from "@/components/JobList/JobList";
import { getAppliedJobs } from "@/api/JobAppliedApi/getAppliedJobs";

export default function AppliedPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await getAppliedJobs();
        const formattedJobs: Job[] = data.map((d) => ({
          job_id: d.job_id,
          job_title: d.job_title,
          company_name: d.company_name,
          posted_days: "Recently applied",
          role: "Full-time", // We can use real role if it was in JobAppliedResponse
          saved: false,
        }));
        setJobs(formattedJobs);
      } catch (err) {
        console.error("Failed to fetch applied jobs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-zinc-100 bg-zinc-50/30">
        <div className="container mx-auto px-6 lg:px-12 py-10">
          <h1 className="text-3xl font-bold text-zinc-900">Applied Jobs</h1>
          <p className="text-zinc-500 mt-2">Track the status of your recent applications.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 lg:px-12 py-10">
        <div className="w-full">
          {isLoading ? (
            <div className="text-center text-zinc-500 py-10 animate-pulse">Loading applied jobs...</div>
          ) : (
            <JobList jobs={jobs} filterApplied={true} />
          )}
        </div>
      </div>
    </div>
  );
}
