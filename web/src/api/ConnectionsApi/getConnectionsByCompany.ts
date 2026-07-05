import { axiosInstance } from "../axiosInstance";
import { ConnectionDto, PaginatedResponse } from "./getConnections";

export async function getConnectionsByCompany(company: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<ConnectionDto>> {
  try {
    const res = await axiosInstance.get<PaginatedResponse<ConnectionDto>>(
      `/connections/company?company=${encodeURIComponent(company)}&page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching connections by company:", error);
    throw error;
  }
}
