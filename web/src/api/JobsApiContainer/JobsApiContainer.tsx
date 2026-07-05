import React from "react";
import axios from "axios";
import { cookies } from "next/headers";
import { JobList, Job } from "@/components/JobList/JobList";

interface PaginatedJobResponse {
  jobs: Job[];
  page: number;
  limit: number;
  total_estimated?: number | null;
}

export async function JobsApiContainer({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const keyword =
    typeof params?.job_title === "string" ? params.job_title : "";
  const searchLocation =
    typeof params?.location === "string" ? params.location : "";

  // Helper to parse array parameters
  const parseArray = (val: string | string[] | undefined) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(",").map((s) => s.trim());
  };

  const payload = {
    keyword: keyword,
    location: searchLocation,
    job_roles: parseArray(params?.job_roles),
    job_types: parseArray(params?.job_types),
    locations: parseArray(params?.locations),
    companies: parseArray(params?.companies),
    duration: typeof params?.duration === "string" ? params.duration : null,
    page: typeof params?.page === "string" ? parseInt(params.page, 10) : 1,
    limit: 10,
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const url = `${baseUrl}/api/jobs-search/search`;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let jobs: Job[] = [];
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Cookie = `access_token=${token}`;
    }

    const res = await axios.post<PaginatedJobResponse>(url, payload, { headers });
    jobs = res.data.jobs;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to fetch jobs, status:", error.response?.status);
    } else {
      console.error("Failed to fetch jobs:", error);
    }
  }

  return <JobList jobs={jobs} />;
}
