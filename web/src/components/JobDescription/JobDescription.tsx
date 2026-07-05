"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase, Loader2 } from "lucide-react";
import { JobDetailResponse } from "@/api/JobDetailApiContainer/JobDetailApiContainer";
import { processAtsResume } from "@/api/ResumeAtsApi/processAtsResume";
import { toast } from "sonner";

interface AxiosErrorLike {
  response?: {
    status?: number;
    data?: {
      detail?: string;
    };
  };
}

export const JobDescription = ({
  jobDetail,
}: {
  jobDetail?: JobDetailResponse | null;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!jobDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          Job details unavailable
        </h2>
        <p className="text-zinc-500">
          We couldn&apos;t fetch the details for this job.
        </p>
      </div>
    );
  }

  const getInitials = (name?: string | null) =>
    name ? name.substring(0, 1).toUpperCase() : "J";

  return (
    <div className="flex flex-col gap-10">
      {/* Header Area */}
      <div className="flex flex-col gap-6">
        <div className="relative w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-sm overflow-hidden">
          {jobDetail.company_logo ? (
            <Image
              src={jobDetail.company_logo}
              alt={jobDetail.company_name || "Company logo"}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            getInitials(jobDetail.company_name)
          )}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2 tracking-tight">
            {jobDetail.job_title || "Unknown Title"}
          </h1>
          <p className="text-lg text-zinc-600 font-medium mb-6">
            {jobDetail.company_name || "Unknown Company"}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 w-full">
            <div className="flex flex-wrap gap-3">
              <Badge
                variant="secondary"
                className="bg-white border-zinc-200 text-zinc-700 py-1.5 px-3 rounded-full text-sm font-medium flex items-center gap-1.5"
              >
                <Briefcase className="w-4 h-4 text-zinc-400" /> Full-time
              </Badge>
              {jobDetail.location && (
                <Badge
                  variant="secondary"
                  className="bg-white border-zinc-200 text-zinc-700 py-1.5 px-3 rounded-full text-sm font-medium flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4 text-zinc-400" />{" "}
                  {jobDetail.location}
                </Badge>
              )}
              {jobDetail.posted_date && (
                <Badge
                  variant="secondary"
                  className="bg-white border-zinc-200 text-zinc-700 py-1.5 px-3 rounded-full text-sm font-medium flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4 text-zinc-400" />{" "}
                  {jobDetail.posted_date}
                </Badge>
              )}
            </div>
            <Button
              className="rounded-none"
              disabled={isProcessing}
              onClick={async () => {
                if (!jobDetail.job_id || !jobDetail.description) {
                  // Fallback if missing data
                  window.dispatchEvent(new CustomEvent("switchTab", { detail: "resume" }));
                  return;
                }
                
                try {
                  setIsProcessing(true);
                  await processAtsResume({
                    job_id: jobDetail.job_id,
                    job_description: jobDetail.description
                  });
                  toast.success("Tailored resume generated successfully!");
                  window.dispatchEvent(new CustomEvent("switchTab", { detail: "resume" }));
                } catch (error) {
                  console.error("Failed to process ATS resume:", error);
                  const axiosError = error as AxiosErrorLike;
                  const errorMessage = axiosError.response?.data?.detail || "Failed to generate tailored resume. Please verify your Gemini API key config.";
                  toast.error(errorMessage);
                } finally {
                  setIsProcessing(false);
                }
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to apply"
              )}
            </Button>
          </div>
        </div>
      </div>

      <hr className="border-zinc-200" />

      {/* Description Area */}
      <div className="prose prose-zinc max-w-none text-zinc-600 pb-12">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">
          About the Role
        </h2>
        <div
          className="mb-6 leading-relaxed text-base whitespace-pre-line"
          dangerouslySetInnerHTML={{
            __html: (
              jobDetail.description || "No description provided."
            ).replace(/\n+/g, "\n\n"),
          }}
        />
      </div>
    </div>
  );
};

export const JobDescriptionShimmer = () => {
  return (
    <div className="flex flex-col gap-10 w-full animate-pulse">
      {/* Header Area */}
      <div className="flex flex-col gap-6">
        <div className="w-16 h-16 bg-zinc-200 rounded-2xl shadow-sm"></div>
        <div>
          <div className="h-10 bg-zinc-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-zinc-200 rounded w-1/4 mb-6"></div>

          <div className="flex flex-wrap gap-3">
            <div className="h-8 bg-zinc-200 rounded-full w-24"></div>
            <div className="h-8 bg-zinc-200 rounded-full w-32"></div>
            <div className="h-8 bg-zinc-200 rounded-full w-28"></div>
          </div>
        </div>
      </div>

      <hr className="border-zinc-200" />

      {/* Description Area */}
      <div className="pb-12">
        <div className="h-8 bg-zinc-200 rounded w-48 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 rounded w-11/12"></div>
          <div className="h-4 bg-zinc-200 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 rounded w-4/5"></div>
        </div>

        <div className="h-6 bg-zinc-200 rounded w-40 mb-4 mt-10"></div>
        <div className="space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 rounded w-5/6"></div>
          <div className="h-4 bg-zinc-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};
