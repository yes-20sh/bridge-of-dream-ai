import { axiosInstance } from "../axiosInstance";

export interface ApplyLinkItem {
  platform: string;
  logo: string;
  url: string;
  description: string;
  status?: string;
}

export interface ApplyLinkSearchResponse {
  links: ApplyLinkItem[];
}

export const searchApplyLinks = async (
  jobId: string,
  jobTitle: string,
  companyName: string
): Promise<ApplyLinkSearchResponse> => {
  const response = await axiosInstance.post<ApplyLinkSearchResponse>("/apply-links/search", {
    job_id: jobId,
    job_title: jobTitle,
    company_name: companyName,
  });
  return response.data;
};
