import { axiosInstance } from "../axiosInstance";

export interface ConnectionDto {
  id: number;
  name: string;
  profile: string;
  job: string;
  company: string;
  location: string;
  email: string;
  number: string;
  lprofile: string;
  linkedin_link: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  data: T[];
}

export async function getConnections(
  company: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<ConnectionDto>> {
  try {
    const res = await axiosInstance.get<PaginatedResponse<ConnectionDto>>(
      `/connections?company=${encodeURIComponent(company)}&page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching connections:", error);
    throw error;
  }
}
