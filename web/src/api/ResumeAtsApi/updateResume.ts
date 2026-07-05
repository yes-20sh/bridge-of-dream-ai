import { axiosInstance } from "../axiosInstance";
import { ResumeResponse } from "./getResume";

export interface ResumeUpdateRequest {
  job_id: string;
  old_text: string;
  new_text: string;
}

export async function updateResume(data: ResumeUpdateRequest): Promise<ResumeResponse> {
  try {
    const res = await axiosInstance.put<ResumeResponse>("/resume-ats/resume", data);
    return res.data;
  } catch (error) {
    console.error("Error updating resume:", error);
    throw error;
  }
}
