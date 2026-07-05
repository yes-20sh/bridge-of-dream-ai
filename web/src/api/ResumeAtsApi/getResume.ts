import { axiosInstance } from "../axiosInstance";

export interface ResumeResponse {
  id: number;
  user_id: number;
  cloudinary_url: string;
  extracted_data?: {
    text: string;
    filename: string;
  } | null;
  created_at?: string;
}

export async function getResume(jobId: string): Promise<ResumeResponse> {
  try {
    const res = await axiosInstance.get<ResumeResponse>(`/resume-ats/resume?job_id=${encodeURIComponent(jobId)}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching resume:", error);
    throw error;
  }
}
