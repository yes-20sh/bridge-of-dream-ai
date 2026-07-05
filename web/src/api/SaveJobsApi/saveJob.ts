import { axiosInstance } from "../axiosInstance";

export interface SaveJobInput {
  job_id: string;
  description?: string | null;
  logo?: string | null;
  job_type?: string | null;
  location?: string | null;
  date?: string | null;
  job_title?: string | null;
  company_name?: string | null;
}

export interface SaveJobResponse {
  message: string;
}

export async function saveJob(data: SaveJobInput): Promise<SaveJobResponse> {
  try {
    const res = await axiosInstance.post<SaveJobResponse>("/saved-jobs/save", data);
    return res.data;
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
}
