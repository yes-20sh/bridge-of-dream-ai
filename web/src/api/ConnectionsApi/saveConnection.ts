import { axiosInstance } from "../axiosInstance";

export interface SaveConnectionInput {
  target_linkedin_url: string;
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

export interface SaveConnectionResponse {
  message: string;
}

export async function saveConnection(data: SaveConnectionInput): Promise<SaveConnectionResponse> {
  try {
    const res = await axiosInstance.post<SaveConnectionResponse>("/connections/save", data);
    return res.data;
  } catch (error) {
    console.error("Error saving connection:", error);
    throw error;
  }
}
