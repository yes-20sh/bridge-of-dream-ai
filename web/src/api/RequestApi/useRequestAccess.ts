import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { requestFormSchema } from "@/validations/requestValidation";

export type RequestFormData = z.infer<typeof requestFormSchema>;
export type RequestFormErrors = Partial<Record<keyof RequestFormData, string>>;

export const useRequestAccess = () => {
  const [formData, setFormData] = useState<RequestFormData>({
    name: "",
    email: "",
    mobile_number: "",
    description: "",
  });

  const [errors, setErrors] = useState<RequestFormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof RequestFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = requestFormSchema.safeParse(formData);
    if (!result.success) {
      const validationErrors: RequestFormErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof RequestFormData;
        if (!validationErrors[path]) {
          validationErrors[path] = issue.message;
        }
      });
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await axios.post(
        `${baseUrl}/api/requests/create-request`,
        formData,
      );
      toast.success(response.data?.message || "Request successfully saved");
      setFormData({ name: "", email: "", mobile_number: "", description: "" });
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
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
};
