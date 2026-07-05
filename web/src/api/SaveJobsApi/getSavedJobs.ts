import { axiosInstance } from "../axiosInstance";

export interface SavedJobDto {
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

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  data: T[];
}

export async function getSavedJobs(page: number = 1, limit: number = 10): Promise<PaginatedResponse<SavedJobDto>> {
  try {
    const res = await axiosInstance.get<PaginatedResponse<SavedJobDto>>(
      `/saved-jobs/all?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    throw error;
  }
}
