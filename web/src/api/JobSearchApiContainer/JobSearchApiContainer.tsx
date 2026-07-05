import React from "react";
import axios from "axios";
import { cookies } from "next/headers";
import { JobFilter } from "@/components/JobFilter/JobFilter";

export interface JobFilterData {
  id: number;
  jobRoles?: string[] | null;
  jobTypes?: string[] | null;
  locations?: string[] | null;
  companies?: string[] | null;
}

export async function JobSearchApiContainer() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const url = `${baseUrl}/api/jobs-search/filter`;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let filterData: JobFilterData | null = null;

  if (token) {
    try {
      const res = await axios.get<JobFilterData>(url, {
        headers: {
          Cookie: `access_token=${token}`,
        },
      });
      filterData = res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch job search filter, status:", error.response?.status);
      } else {
        console.error("Failed to fetch job search filter:", error);
      }
    }
  }

  return <JobFilter initialData={filterData} />;
}
