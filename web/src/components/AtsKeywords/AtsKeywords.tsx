import React, { useState, useEffect } from "react";
import { Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { analyzeKeywords, KeywordAnalysisItem } from "@/api/ResumeAtsApi/analyzeKeywords";
import { axiosInstance } from "@/api/axiosInstance";

interface AtsKeywordsProps {
  hasResume?: boolean;
  editedText?: string;
  onAddKeyword?: (keyword: string) => void;
  onSelectKeywordItem?: (item: KeywordAnalysisItem) => void;
  selectedKeyword?: string;
  onAnalysisLoaded?: (data: KeywordAnalysisItem[]) => void;
}

interface AxiosErrorLike {
  response?: {
    status?: number;
    data?: {
      detail?: string;
    };
  };
}

export const AtsKeywords = ({ 
  hasResume = true,
  editedText = "", 
  onAddKeyword,
  onSelectKeywordItem,
  selectedKeyword,
  onAnalysisLoaded
}: AtsKeywordsProps) => {
  const [analysisData, setAnalysisData] = useState<KeywordAnalysisItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const jobId = params?.id as string;

  useEffect(() => {
    async function loadKeywords() {
      if (!jobId || !hasResume) {
        setAnalysisData(null);
        return;
      }
      setIsLoading(true);
      try {
        const jobRes = await axiosInstance.post('/jobs-search/job-details', {
          job_id: jobId,
          job_url: `https://www.linkedin.com/jobs/view/${jobId}`
        });
        const description = jobRes.data?.description;
        if (description) {
          try {
            const atsRes = await analyzeKeywords(jobId);
            setAnalysisData(atsRes.analysis_data);
            if (onAnalysisLoaded) {
              onAnalysisLoaded(atsRes.analysis_data);
            }
          } catch (err) {
            const axiosError = err as AxiosErrorLike;
            if (axiosError.response?.status === 404) {
              setAnalysisData(null);
            } else {
              console.error("Failed to load keywords analysis:", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load job details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadKeywords();
  }, [jobId, hasResume]);

  const isPresent = (kw: string) => editedText.toLowerCase().includes(kw.toLowerCase());

  const handleKeywordClick = (item: KeywordAnalysisItem) => {
    if (!isPresent(item.keyword)) {
      if (onSelectKeywordItem) {
        onSelectKeywordItem(item);
      } else if (onAddKeyword) {
        onAddKeyword(item.keyword);
      }
    }
  };

  const renderBadge = (item: KeywordAnalysisItem) => {
    const present = isPresent(item.keyword);
    const isSelected = selectedKeyword === item.keyword;
    
    let colorClasses = "hover:bg-zinc-200 bg-zinc-100 text-zinc-700 border-transparent";
    
    if (present) {
      if (item.priority.toLowerCase() === 'high') {
        colorClasses = "bg-green-500 text-white hover:bg-green-600 border-green-500";
      } else if (item.priority.toLowerCase() === 'medium') {
        colorClasses = "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500";
      } else if (item.priority.toLowerCase() === 'low') {
        colorClasses = "bg-blue-500 text-white hover:bg-blue-600 border-blue-500";
      } else {
        colorClasses = "bg-black text-white hover:bg-zinc-800 border-black";
      }
    } else if (isSelected) {
      colorClasses = "bg-black text-white hover:bg-zinc-800 border-black";
    }

    return (
      <Badge
        key={item.keyword}
        variant="secondary"
        onClick={() => handleKeywordClick(item)}
        className={`flex items-center gap-1 cursor-pointer rounded-full transition-colors border ${colorClasses}`}
      >
        {item.keyword}
        {present ? (
          <Check className="w-3 h-3 ml-1 text-white" />
        ) : (
          <Plus className={`w-3 h-3 ml-1 ${isSelected ? 'text-white' : 'text-zinc-500'}`} />
        )}
      </Badge>
    );
  };

  return (
    <div className="sticky top-24">
      <h2 className="text-xl font-bold text-zinc-900 mb-2">
        Keywords for ATS
      </h2>
      <p className="text-sm text-zinc-500 mb-6">
        Boost your resume&apos;s compatibility with applicant tracking systems
        by adding these recommended keywords.
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div>
            <div className="h-4 bg-zinc-200 rounded w-1/3 mb-3"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-zinc-200 rounded-full w-20"></div>
              <div className="h-6 bg-zinc-200 rounded-full w-24"></div>
              <div className="h-6 bg-zinc-200 rounded-full w-16"></div>
            </div>
          </div>
          <div>
            <div className="h-4 bg-zinc-200 rounded w-1/3 mb-3"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-zinc-200 rounded-full w-28"></div>
              <div className="h-6 bg-zinc-200 rounded-full w-16"></div>
            </div>
          </div>
        </div>
      ) : analysisData ? (
        <div className="flex flex-col gap-6">
          {(analysisData.filter(k => k.priority.toLowerCase() === 'high').length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                High Priority
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisData.filter(k => k.priority.toLowerCase() === 'high').map(k => renderBadge(k))}
              </div>
            </div>
          )}
          {(analysisData.filter(k => k.priority.toLowerCase() === 'medium').length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Medium Priority
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisData.filter(k => k.priority.toLowerCase() === 'medium').map(k => renderBadge(k))}
              </div>
            </div>
          )}
          {(analysisData.filter(k => k.priority.toLowerCase() === 'low').length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Low Priority
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisData.filter(k => k.priority.toLowerCase() === 'low').map(k => renderBadge(k))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 border border-dashed border-zinc-200 text-center text-zinc-400 text-xs">
          Keywords will be available once the resume is generated/tailored for this job.
        </div>
      )}
    </div>
  );
};
