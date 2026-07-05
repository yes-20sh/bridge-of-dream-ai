import { axiosInstance } from "../axiosInstance";

export interface KeywordAnalysisItem {
  keyword: string;
  priority: string;
  weightage: number;
  is_matching: boolean;
  old_sentence?: string;
  new_sentence?: string;
}

export interface AnalyzeKeywordsResponse {
  id: number;
  analysis_data: KeywordAnalysisItem[];
}

export const analyzeKeywords = async (jobId: string): Promise<AnalyzeKeywordsResponse> => {
  const response = await axiosInstance.post<AnalyzeKeywordsResponse>("/resume-ats/keywords/analyze", {
    job_id: jobId,
  });
  return response.data;
};
