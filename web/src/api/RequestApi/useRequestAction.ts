import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface RequestActionData {
  request_id: number;
  approve: boolean;
}

export const useRequestAction = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (data: RequestActionData) => {
    setLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await axios.post(`${baseUrl}/api/requests/action`, data);
      
      toast.success(response.data?.message || "Action processed successfully");
      router.refresh();
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message,
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
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
    handleAction,
  };
};
