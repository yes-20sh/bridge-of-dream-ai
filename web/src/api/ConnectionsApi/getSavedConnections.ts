import { axiosInstance } from "../axiosInstance";
import { ConnectionDto, PaginatedResponse } from "./getConnections";

export async function getSavedConnections(page: number = 1, limit: number = 10): Promise<PaginatedResponse<ConnectionDto>> {
  try {
    const res = await axiosInstance.get<PaginatedResponse<ConnectionDto>>(
      `/connections/all?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching saved connections:", error);
    throw error;
  }
}
