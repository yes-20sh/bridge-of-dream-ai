import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface SignInData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (data: SignInData) => {
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // Request includes credentials for cookie setting if needed
      const response = await axios.post(`${baseUrl}/api/auth/signin`, data, {
        withCredentials: true,
      });
      
      toast.success(response.data?.message || "Successfully signed in");
      
      // Store the token in a client-side cookie so Next.js Server Components can access it
      const token = response.data?.access_token;
      if (token) {
        const maxAge = data.remember_me ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        const secureFlag = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
      }

      // Redirect to dashboard or home
      router.push("/explore");
      router.refresh();
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            "Failed to sign in. Please check your credentials.",
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred during sign in");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignIn,
  };
};
