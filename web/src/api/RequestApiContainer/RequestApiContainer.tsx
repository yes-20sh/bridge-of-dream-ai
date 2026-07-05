import React from "react";
import axios from "axios";
import { RequestTab } from "@/components/RequestTab/RequestTab";

export async function RequestApiContainer({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = parseInt((params?.page as string) || "1", 10);
  const limit = 10;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const url = `${baseUrl}/api/requests/all-request`;

  let requestsData = [];
  let totalPages = 1;
  
  try {
    const res = await axios.get(url, {
      params: {
        page,
        limit,
      },
    });
    requestsData = res.data.data || [];
    totalPages = res.data.total_pages || 1;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Failed to fetch requests, status:",
        error.response?.status,
      );
    } else {
      console.error("Failed to fetch requests:", error);
    }
  }

  return <RequestTab requestsData={requestsData} currentPage={page} totalPages={totalPages} />;
}
