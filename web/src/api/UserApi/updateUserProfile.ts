import axios from "axios";

export async function updateUserProfile(data: {
  profile_data?: string;
  file?: File | null;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const url = `${baseUrl}/api/user/profile`;

  try {
    const formData = new FormData();
    if (data.profile_data) {
      formData.append("profile_data", data.profile_data);
    }
    if (data.file) {
      formData.append("file", data.file);
    }

    const res = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to update user profile, status:", error.response?.status);
    } else {
      console.error("Failed to update user profile:", error);
    }
    throw error;
  }
}
