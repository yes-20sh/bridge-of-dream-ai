import { axiosInstance } from "../axiosInstance";

export interface SaveJobAppliedRequest {
  job_id: string;
  job_title: string;
  company_name: string;
  company_logo?: string;
  job_description?: string;
  job_type?: string;
  location?: string;
  apply_status?: string;
  ats_resume_id?: number;
}

export interface JobAppliedResponse {
  id: number;
  user_id: number;
  job_id: string;
  job_title: string;
  company_name: string;
  apply_status: string;
}

export const saveJobApplied = async (
  data: SaveJobAppliedRequest
): Promise<JobAppliedResponse> => {
  const response = await axiosInstance.post("/job_applied/save", data);
  return response.data;
};
