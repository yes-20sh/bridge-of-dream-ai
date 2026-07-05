import axios from "axios";

export async function logoutUser() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const url = `${baseUrl}/api/auth/logout`;

  try {
    const res = await axios.post(
      url,
      {},
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to logout, status:", error.response?.status);
    } else {
      console.error("Failed to logout:", error);
    }
    throw error;
  }
}
