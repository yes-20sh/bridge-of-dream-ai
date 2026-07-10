import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (data: ForgotPasswordData) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await axios.post(`${baseUrl}/api/auth/forgot-password`, data, {
        withCredentials: true,
      });
      toast.success(response.data?.message || "OTP sent successfully");
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || "Failed to send OTP");
      } else {
        toast.error("An unknown error occurred");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: VerifyOtpData) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await axios.post(`${baseUrl}/api/auth/verify-otp`, data, {
        withCredentials: true,
      });
      toast.success(response.data?.message || "OTP verified");
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || "Invalid OTP");
      } else {
        toast.error("An unknown error occurred");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordData) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await axios.post(`${baseUrl}/api/auth/reset-password`, data, {
        withCredentials: true,
      });
      toast.success(response.data?.message || "Password reset successfully");
      router.push("/signin");
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || "Failed to reset password");
      } else {
        toast.error("An unknown error occurred");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleForgotPassword,
    handleVerifyOtp,
    handleResetPassword,
  };
};
