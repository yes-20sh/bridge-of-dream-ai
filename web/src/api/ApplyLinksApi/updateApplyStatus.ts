import { axiosInstance } from "../axiosInstance";

export interface ApplyStatusItemSchema {
  platform: string;
  url: string;
  status: string;
}

export interface UpdateApplyStatusResponse {
  success: boolean;
  message: string;
  apply_statuses: ApplyStatusItemSchema[];
}

export const updateApplyStatus = async (
  jobId: string,
  platform: string,
  url: string,
  status: string
): Promise<UpdateApplyStatusResponse> => {
  const response = await axiosInstance.post<UpdateApplyStatusResponse>("/apply-links/status", {
    job_id: jobId,
    platform,
    url,
    status,
  });
  return response.data;
};
