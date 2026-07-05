import { axiosInstance } from "../axiosInstance";

export interface HeaderMetricsResponse {
  network: number;
  applied: number;
  saved: number;
}

export const getHeaderMetrics = async (): Promise<HeaderMetricsResponse> => {
  const response = await axiosInstance.get("/general/metrics");
  return response.data;
};
