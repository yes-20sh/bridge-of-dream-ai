import React from "react";
import axios from "axios";
import { cookies } from "next/headers";
import { JobDescription } from "@/components/JobDescription/JobDescription";

export interface JobDetailResponse {
  job_id?: string | null;
  job_url?: string | null;
  company_name?: string | null;
  company_logo?: string | null;
  job_title?: string | null;
  location?: string | null;
  description?: string | null;
  posted_date?: string | null;
}

export async function JobDetailApiContainer({ jobId, isApplied }: { jobId?: string, isApplied?: boolean }) {
  if (!jobId) {
    return <JobDescription jobDetail={null} />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let jobDetail: JobDetailResponse | null = null;
  
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Cookie = `access_token=${token}`;
    }

    if (isApplied) {
      const url = `${baseUrl}/api/job_applied/details/${jobId}`;
      const res = await axios.get<JobDetailResponse>(url, { headers });
      jobDetail = res.data;
    } else {
      const url = `${baseUrl}/api/jobs-search/job-details`;
      const payload = {
        job_id: jobId,
        job_url: `https://www.linkedin.com/jobs/view/${jobId}`,
      };
      const res = await axios.post<JobDetailResponse>(url, payload, { headers });
      jobDetail = res.data;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to fetch job details, status:", error.response?.status);
    } else {
      console.error("Failed to fetch job details:", error);
    }
  }

  return <JobDescription jobDetail={jobDetail} />;
}
