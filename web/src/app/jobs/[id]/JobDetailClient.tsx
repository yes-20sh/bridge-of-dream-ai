"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResumeViewer } from "@/components/ResumeViewer/ResumeViewer";
import { ApplicationTracker } from "@/components/ApplicationTracker/ApplicationTracker";
import { NetworkList } from "@/components/NetworkList/NetworkList";
import { axiosInstance } from "@/api/axiosInstance";
import { ApplyLinks } from "@/components/ApplyLinks/ApplyLinks";
import {
  searchApplyLinks,
  ApplyLinkItem,
} from "@/api/ApplyLinksApi/searchApplyLinks";

interface JobDetail {
  job_id?: string | null;
  job_url?: string | null;
  company_name?: string | null;
  company_logo?: string | null;
  job_title?: string | null;
  location?: string | null;
  description?: string | null;
  posted_date?: string | null;
  apply_status?: string | null;
}

export function JobDetailClient({
  descriptionContent,
}: {
  descriptionContent: React.ReactNode;
}) {
  const [activeView, setActiveView] = useState<
    "description" | "resume" | "status" | "connections" | "apply"
  >("description");
  const [companyName, setCompanyName] = useState<string>("");
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [unlockedTabs, setUnlockedTabs] = useState<string[]>(["description"]);
  const params = useParams();
  const jobId = params?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);

  if (searchParams !== prevSearchParams) {
    setPrevSearchParams(searchParams);

    const isApplied = searchParams?.get("applied") === "true";
    const tab = searchParams?.get("tab");

    if (isApplied) {
      setUnlockedTabs([
        "description",
        "resume",
        "apply",
        "connections",
        "status",
      ]);
    }

    if (
      tab &&
      ["description", "resume", "status", "connections", "apply"].includes(tab)
    ) {
      setActiveView(
        tab as "description" | "resume" | "status" | "connections" | "apply",
      );
      if (tab === "status") {
        setUnlockedTabs([
          "description",
          "resume",
          "apply",
          "connections",
          "status",
        ]);
      } else if (!isApplied) {
        setUnlockedTabs((prev) => Array.from(new Set([...prev, tab])));
      }
    }
  }

  const handleTabChange = (view: typeof activeView) => {
    setActiveView(view);
    const newParams = new URLSearchParams(searchParams?.toString() || "");
    newParams.set("tab", view);
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    async function fetchJobDetails() {
      if (!jobId) return;
      try {
        const res = await axiosInstance.post<JobDetail>(
          "/jobs-search/job-details",
          {
            job_id: jobId,
            job_url: `https://www.linkedin.com/jobs/view/${jobId}`,
          },
        );
        if (res.data) {
          setJobDetail(res.data);
          if (res.data.company_name) {
            setCompanyName(res.data.company_name);
          }
          if (res.data.apply_status === "applied") {
            setUnlockedTabs([
              "description",
              "resume",
              "apply",
              "connections",
              "status",
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);
      }
    }
    fetchJobDetails();
  }, [jobId]);

  const [applyLinks, setApplyLinks] = useState<ApplyLinkItem[]>([]);
  const [isApplyLinksLoading, setIsApplyLinksLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadApplyLinks() {
      if (!jobId || !jobDetail) return;
      setIsApplyLinksLoading(true);
      try {
        const res = await searchApplyLinks(
          jobId,
          jobDetail.job_title || "",
          jobDetail.company_name || "",
        );
        if (res && res.links) {
          setApplyLinks(res.links);
        }
      } catch (err) {
        console.error("Failed to fetch apply links:", err);
      } finally {
        setIsApplyLinksLoading(false);
      }
    }
    if (activeView === "apply") {
      loadApplyLinks();
    }
  }, [jobId, jobDetail, activeView]);

  useEffect(() => {
    const handleSwitchTab = (e: CustomEvent) => {
      if (
        e.detail === "resume" ||
        e.detail === "description" ||
        e.detail === "status" ||
        e.detail === "connections" ||
        e.detail === "apply"
      ) {
        if (e.detail === "status") {
          setUnlockedTabs([
            "description",
            "resume",
            "apply",
            "connections",
            "status",
          ]);
        } else {
          setUnlockedTabs((prev) => Array.from(new Set([...prev, e.detail])));
        }
        setActiveView(e.detail);
        const newParams = new URLSearchParams(window.location.search);
        newParams.set("tab", e.detail);
        router.replace(`?${newParams.toString()}`, { scroll: false });
      }
    };

    const handleUnlockAllTabs = () => {
      setUnlockedTabs([
        "description",
        "resume",
        "apply",
        "connections",
        "status",
      ]);
    };

    window.addEventListener("switchTab", handleSwitchTab as EventListener);
    window.addEventListener(
      "unlockAllTabs",
      handleUnlockAllTabs as EventListener,
    );
    return () => {
      window.removeEventListener("switchTab", handleSwitchTab as EventListener);
      window.removeEventListener(
        "unlockAllTabs",
        handleUnlockAllTabs as EventListener,
      );
    };
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* Page Header with Centered Navigation */}
      <div className="bg-white border-b border-zinc-200 sticky top-[72px] z-40">
        <div className="container mx-auto px-6 lg:px-12 flex h-16 items-center justify-between">
          {/* Left: Back Link */}
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors w-[120px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          {/* Center: Navigation Options */}
          <div className="flex items-center gap-6 sm:gap-10 font-medium text-sm sm:text-base overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleTabChange("description")}
              disabled={!unlockedTabs.includes("description")}
              className={`relative h-16 flex items-center transition-colors whitespace-nowrap ${
                activeView === "description"
                  ? "text-zinc-900"
                  : unlockedTabs.includes("description")
                    ? "text-zinc-500 hover:text-zinc-900"
                    : "text-zinc-300 cursor-not-allowed"
              }`}
            >
              Job Description
              {activeView === "description" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-md" />
              )}
            </button>
            <button
              onClick={() => handleTabChange("resume")}
              disabled={!unlockedTabs.includes("resume")}
              className={`relative h-16 flex items-center transition-colors whitespace-nowrap ${
                activeView === "resume"
                  ? "text-zinc-900"
                  : unlockedTabs.includes("resume")
                    ? "text-zinc-500 hover:text-zinc-900"
                    : "text-zinc-300 cursor-not-allowed"
              }`}
            >
              Resume
              {activeView === "resume" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-md" />
              )}
            </button>
            <button
              onClick={() => handleTabChange("apply")}
              disabled={!unlockedTabs.includes("apply")}
              className={`relative h-16 flex items-center transition-colors whitespace-nowrap ${
                activeView === "apply"
                  ? "text-zinc-900"
                  : unlockedTabs.includes("apply")
                    ? "text-zinc-500 hover:text-zinc-900"
                    : "text-zinc-300 cursor-not-allowed"
              }`}
            >
              Apply
              {activeView === "apply" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-md" />
              )}
            </button>
            <button
              onClick={() => handleTabChange("connections")}
              disabled={!unlockedTabs.includes("connections")}
              className={`relative h-16 flex items-center transition-colors whitespace-nowrap ${
                activeView === "connections"
                  ? "text-zinc-900"
                  : unlockedTabs.includes("connections")
                    ? "text-zinc-500 hover:text-zinc-900"
                    : "text-zinc-300 cursor-not-allowed"
              }`}
            >
              Referrals
              {activeView === "connections" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-md" />
              )}
            </button>
            <button
              onClick={() => handleTabChange("status")}
              disabled={!unlockedTabs.includes("status")}
              className={`relative h-16 flex items-center transition-colors whitespace-nowrap ${
                activeView === "status"
                  ? "text-zinc-900"
                  : unlockedTabs.includes("status")
                    ? "text-zinc-500 hover:text-zinc-900"
                    : "text-zinc-300 cursor-not-allowed"
              }`}
            >
              Application Status
              {activeView === "status" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-md" />
              )}
            </button>
          </div>

          {/* Right: Empty space to balance centering */}
          <div className="w-[120px] hidden sm:block"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 lg:px-12 py-10">
        <div className="w-full">
          {activeView === "description" && descriptionContent}
          {activeView === "resume" && <ResumeViewer jobDetail={jobDetail ?? undefined} />}
          {activeView === "connections" && (
            <NetworkList companyName={companyName} showNextStep={true} />
          )}
          {activeView === "status" && <ApplicationTracker />}
          {activeView === "apply" && (
            <ApplyLinks
              jobId={jobId}
              companyName={companyName || "Company"}
              jobTitle={jobDetail?.job_title || "Role"}
              links={applyLinks}
              isLoading={isApplyLinksLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
