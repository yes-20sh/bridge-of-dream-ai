import { axiosInstance } from "../axiosInstance";

export interface ProcessAtsResumeRequest {
  job_id: string;
  job_description: string;
}

export interface ProcessAtsResumeResponse {
  success: boolean;
  message: string;
}

export const processAtsResume = async (
  data: ProcessAtsResumeRequest
): Promise<ProcessAtsResumeResponse> => {
  const response = await axiosInstance.post<ProcessAtsResumeResponse>(
    "/resume-ats/generate",
    data
  );
  return response.data;
};
