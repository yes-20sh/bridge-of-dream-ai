import React from "react";
import axios from "axios";
import { cookies } from "next/headers";
import { JobList, Job } from "@/components/JobList/JobList";

interface SavedJobDto {
  id: number;
  user_id: number;
  job_id: string;
  description?: string | null;
  logo?: string | null;
  job_type?: string | null;
  location?: string | null;
  date?: string | null;
  job_title?: string | null;
  company_name?: string | null;
  created_at: string;
}

interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  data: SavedJobDto[];
}

export async function SavedJobsContainer({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = typeof params?.page === "string" ? parseInt(params.page, 10) : 1;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const url = `${baseUrl}/api/saved-jobs/all?page=${page}&limit=10`;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let jobs: Job[] = [];
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Cookie = `access_token=${token}`;
    }

    const res = await axios.get<PaginatedResponse>(url, { headers });
    
    // Map backend SavedJobDto to frontend Job model
    jobs = (res.data?.data || []).map((sj) => ({
      job_id: sj.job_id,
      job_title: sj.job_title || "Untitled Job",
      company_name: sj.company_name || "Unknown Company",
      company_logo: sj.logo || undefined,
      posted_days: sj.date || "Recently",
      role: sj.job_type || "Full-time",
      location: sj.location || "Remote",
      saved: true,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to fetch saved jobs, status:", error.response?.status);
    } else {
      console.error("Failed to fetch saved jobs:", error);
    }
  }

  return <JobList jobs={jobs} filterSaved={true} />;
}
