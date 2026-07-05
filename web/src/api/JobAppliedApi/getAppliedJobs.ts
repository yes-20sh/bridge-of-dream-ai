import { axiosInstance } from "../axiosInstance";
import { JobAppliedResponse } from "./saveJobApplied";

export const getAppliedJobs = async (): Promise<JobAppliedResponse[]> => {
  const response = await axiosInstance.get("/job_applied/list");
  return response.data;
};
