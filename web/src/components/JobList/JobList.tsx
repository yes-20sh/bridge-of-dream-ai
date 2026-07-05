"use client";

import React, { useState } from "react";
import { Grid, List, Bookmark, MoreVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveJob } from "@/api/SaveJobsApi/saveJob";
import { toast } from "sonner";

export interface Job {
  job_id?: string;
  job_url?: string;
  job_title: string;
  company_name: string;
  company_logo?: string;
  posted_days?: string;
  role?: string;
  saved?: boolean;
  platform_name?: string;
  referral_name?: string;
  location?: string;
}

const EMPTY_JOBS: Job[] = [];

export function JobList({
  jobs = EMPTY_JOBS,
  filterSaved = false,
  filterApplied = false,
}: {
  jobs?: Job[];
  filterSaved?: boolean;
  filterApplied?: boolean;
}) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = searchParams.get("page") || "1";
  const [prevJobs, setPrevJobs] = useState<Job[]>(jobs);
  const [accumulatedJobs, setAccumulatedJobs] = useState<Job[]>(jobs);
  const handleSaveJob = async (e: React.MouseEvent, job: Job, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await saveJob({
        job_id: job.job_id || String(idx),
        description: job.role || "",
        logo: job.company_logo || "",
        job_type: job.role || "Full-time",
        location: job.location,
        date: job.posted_days || "Recently",
        job_title: job.job_title,
        company_name: job.company_name,
      });
      toast.success(res.message);
      setAccumulatedJobs((prev) =>
        prev.map((j, i) => {
          const isTarget = j.job_id ? j.job_id === job.job_id : i === idx;
          if (isTarget) {
            return { ...j, saved: !j.saved };
          }
          return j;
        })
      );
    } catch (error) {
      toast.error("Failed to save job");
    }
  };

  if (jobs !== prevJobs) {
    setPrevJobs(jobs);
    if (currentPage === "1") {
      setAccumulatedJobs(jobs);
    } else {
      setAccumulatedJobs((prev) => {
        // Prevent exact duplicates
        const newJobs = jobs.filter(
          (j) =>
            !prev.some(
              (p) =>
                p.job_title === j.job_title &&
                p.company_name === j.company_name,
            ),
        );
        return [...prev, ...newJobs];
      });
    }
    setIsLoading(false);
  }

  let displayJobs = accumulatedJobs;
  if (filterSaved) displayJobs = displayJobs.filter((j) => j.saved);
  // filterApplied uses the exact passed-in jobs now, no need to dummy filter

  const getInitials = (name: string) =>
    name ? name.substring(0, 1).toUpperCase() : "J";

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-medium text-zinc-600">
          Sort by <span className="text-black font-semibold">Most recent</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          <Grid
            onClick={() => setView("grid")}
            className={`w-5 h-5 cursor-pointer transition-colors ${view === "grid" ? "text-black" : "hover:text-black"}`}
          />
          <List
            onClick={() => setView("list")}
            className={`w-5 h-5 cursor-pointer transition-colors ${view === "list" ? "text-black" : "hover:text-black"}`}
          />
        </div>
      </div>

      {displayJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative w-12 h-12 mb-4 rounded-lg ring-2 ring-zinc-100 overflow-hidden">
            <Image
              src="/no_file.gif"
              alt="No jobs found"
              fill
              sizes="48px"
              className="object-contain"
              unoptimized
            />
          </div>
          <p className="text-zinc-500 font-medium">
            No jobs found for this search.
          </p>
        </div>
      )}

      {/* Conditional Rendering for List vs Grid */}
      {view === "list" ? (
        <div className="flex flex-col">
          {displayJobs.map((job, idx) => (
            <Link
              href={`/jobs/${job.job_id || idx}${filterApplied ? '?applied=true' : ''}`}
              key={idx}
              className="group flex items-start sm:items-center justify-between py-6 border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors -mx-4 px-4 rounded-xl"
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-zinc-800 overflow-hidden">
                  {job.company_logo ? (
                    <Image
                      src={job.company_logo}
                      alt={job.company_name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    getInitials(job.company_name)
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1">
                  <h4 className="font-semibold text-zinc-900 text-base">
                    {job.job_title}
                  </h4>
                  <p className="text-sm text-zinc-500">
                    {job.company_name} · {job.posted_days || "Recently"}
                  </p>
                  {filterApplied && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">Applied</span>
                      {job.platform_name && (
                        <span className="text-[10px] font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                          {job.platform_name}
                        </span>
                      )}
                      {job.referral_name && (
                        <span className="text-[10px] font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                          Ref: {job.referral_name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-12 ml-4">
                {/* Job Type & Location */}
                <div className="hidden sm:flex flex-col gap-1 w-32">
                  <span className="text-sm font-semibold text-zinc-900">
                    {job.role || "Full-time"}
                  </span>
                  <span className="text-xs text-zinc-500">{job.location}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 text-zinc-400">
                  <Bookmark
                    onClick={(e) => handleSaveJob(e, job, idx)}
                    className={`w-5 h-5 cursor-pointer transition-all ${job.saved ? "fill-black text-black scale-110" : "hover:text-black hover:scale-105"}`}
                  />
                  <MoreVertical className="w-5 h-5 cursor-pointer hover:text-black" />
                </div>
              </div>
            </Link>
          ))}
          {isLoading &&
            [1, 2, 3].map((i) => (
              <div
                key={`shimmer-${i}`}
                className="flex items-center justify-between py-6 border-b border-zinc-100 -mx-4 px-4"
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="w-12 h-12 rounded-full bg-zinc-200 animate-pulse flex-shrink-0"></div>
                  <div className="flex flex-col gap-2 w-full max-w-md mt-1">
                    <div className="w-3/4 h-5 bg-zinc-200 animate-pulse rounded"></div>
                    <div className="w-1/2 h-4 bg-zinc-200 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-12 ml-4">
                  <div className="hidden sm:flex flex-col gap-2 w-32 mt-1">
                    <div className="w-20 h-4 bg-zinc-200 animate-pulse rounded"></div>
                    <div className="w-24 h-3 bg-zinc-200 animate-pulse rounded"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-5 h-5 bg-zinc-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {displayJobs.map((job, idx) => (
            <Link
              href={`/jobs/${job.job_id || idx}?url=${encodeURIComponent(job.job_url || "")}${filterApplied ? '&applied=true' : ''}`}
              key={idx}
              className="group flex flex-col justify-between p-6 border border-zinc-200 hover:shadow-xl hover:border-zinc-300 transition-all rounded-2xl bg-white"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-zinc-800 overflow-hidden">
                  {job.company_logo ? (
                    <Image
                      src={job.company_logo}
                      alt={job.company_name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    getInitials(job.company_name)
                  )}
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <Bookmark
                    onClick={(e) => handleSaveJob(e, job, idx)}
                    className={`w-5 h-5 cursor-pointer transition-all ${job.saved ? "fill-black text-black scale-110" : "hover:text-black hover:scale-105"}`}
                  />
                  <MoreVertical className="w-5 h-5 cursor-pointer hover:text-black" />
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <h4 className="font-semibold text-zinc-900 text-lg leading-snug">
                  {job.job_title}
                </h4>
                <p className="text-sm text-zinc-500">
                  {job.company_name} · {job.posted_days || "Recently"}
                </p>
                {filterApplied && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">Applied</span>
                    {job.platform_name && (
                      <span className="text-xs font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                        {job.platform_name}
                      </span>
                    )}
                    {job.referral_name && (
                      <span className="text-xs font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                        Ref: {job.referral_name}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-zinc-100 mt-auto">
                <span className="text-sm font-semibold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">
                  {job.role || "Full-time"}
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  {job.location}
                </span>
              </div>
            </Link>
          ))}
          {isLoading &&
            [1, 2, 3, 4, 5].map((i) => (
              <div
                key={`shimmer-grid-${i}`}
                className="flex flex-col justify-between p-6 border border-zinc-200 rounded-2xl bg-white animate-pulse"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-200 flex-shrink-0"></div>
                  <div className="w-5 h-5 bg-zinc-200 rounded"></div>
                </div>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="w-3/4 h-6 bg-zinc-200 rounded"></div>
                  <div className="w-1/2 h-4 bg-zinc-200 rounded"></div>
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-zinc-100 mt-auto">
                  <div className="w-20 h-6 bg-zinc-200 rounded-full"></div>
                  <div className="w-16 h-4 bg-zinc-200 rounded"></div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Load More Button */}
      {jobs.length >= 10 && !isLoading && (
        <div className="flex justify-end mt-8">
          <Button
            onClick={() => {
              setIsLoading(true);
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", (parseInt(currentPage, 10) + 1).toString());
              router.push(`/explore?${params.toString()}`, { scroll: false });
            }}
            variant="outline"
            className="rounded-full px-6 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            More results
          </Button>
        </div>
      )}
    </>
  );
}

export function JobListShimmer() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="w-32 h-5 bg-zinc-200 animate-pulse rounded"></div>
        <div className="w-16 h-5 bg-zinc-200 animate-pulse rounded"></div>
      </div>
      <div className="flex flex-col">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between py-6 border-b border-zinc-100 -mx-4 px-4"
          >
            <div className="flex items-start gap-4 w-full">
              <div className="w-12 h-12 rounded-full bg-zinc-200 animate-pulse flex-shrink-0"></div>
              <div className="flex flex-col gap-2 w-full max-w-md">
                <div className="w-3/4 h-5 bg-zinc-200 animate-pulse rounded"></div>
                <div className="w-1/2 h-4 bg-zinc-200 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-12 ml-4">
              <div className="hidden sm:flex flex-col gap-2 w-32">
                <div className="w-20 h-4 bg-zinc-200 animate-pulse rounded"></div>
                <div className="w-24 h-3 bg-zinc-200 animate-pulse rounded"></div>
              </div>
              <div className="flex gap-4">
                <div className="w-5 h-5 bg-zinc-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
