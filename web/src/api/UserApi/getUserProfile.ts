import axios from "axios";
import { cookies } from "next/headers";

export async function getUserProfile() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const url = `${baseUrl}/api/user/profile`;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const res = await axios.get(url, {
      headers: {
        Cookie: `access_token=${token}`,
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to fetch user profile, status:", error.response?.status);
    } else {
      console.error("Failed to fetch user profile:", error);
    }
    return null;
  }
}
