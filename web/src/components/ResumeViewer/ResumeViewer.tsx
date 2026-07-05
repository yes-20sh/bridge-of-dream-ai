import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Check, Loader2 } from "lucide-react";
import { getResume, ResumeResponse } from "@/api/ResumeAtsApi/getResume";
import { updateResume } from "@/api/ResumeAtsApi/updateResume";
import { saveJobApplied } from "@/api/JobAppliedApi/saveJobApplied";
import { KeywordAnalysisItem } from "@/api/ResumeAtsApi/analyzeKeywords";
import { AtsKeywords } from "@/components/AtsKeywords/AtsKeywords";
import { ResumeAtsEditor } from "@/components/ResumeAtsEditor/ResumeAtsEditor";
import { useParams } from "next/navigation";

interface AxiosErrorLike {
  response?: {
    status?: number;
    data?: {
      detail?: string;
    };
  };
}

export interface ResumeViewerJobDetail {
  job_title?: string | null;
  company_name?: string | null;
  company_logo?: string | null;
  description?: string | null;
  location?: string | null;
}

export const ResumeViewer = ({
  jobDetail,
}: {
  jobDetail?: ResumeViewerJobDetail;
}) => {
  const params = useParams();
  const jobId = params?.id as string;

  const [score, setScore] = useState(0);

  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const [analysisData, setAnalysisData] = useState<KeywordAnalysisItem[]>([]);
  const [selectedKeywordItem, setSelectedKeywordItem] =
    useState<KeywordAnalysisItem | null>(null);

  const targetScore = React.useMemo(() => {
    return analysisData.reduce((acc, curr) => {
      const escaped = curr.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, "i");
      const isMatch = curr.is_matching || regex.test(editedText);
      return isMatch ? acc + (curr.weightage || 0) : acc;
    }, 0);
  }, [analysisData, editedText]);

  useEffect(() => {
    const fetchResume = async () => {
      if (!jobId) return;
      try {
        const data = await getResume(jobId);
        setResume(data);
        if (data.extracted_data?.text) {
          setEditedText(data.extracted_data.text);
        }
      } catch (error) {
        const axiosError = error as AxiosErrorLike;
        if (axiosError.response?.status === 404) {
          setResume(null);
        } else {
          console.error("Failed to load resume", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchResume();
  }, [jobId]);

  useEffect(() => {
    if (analysisData.length === 0) return;

    const initialScore = score;
    let startTimestamp: number | null = null;
    const duration = 1000; // 1 second animation

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(
        initialScore + (targetScore - initialScore) * easeProgress,
      );
      setScore(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setScore(targetScore);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [targetScore]); // Intentionally not including score in deps so it only re-animates when target changes

  const getScoreColor = (s: number) => {
    if (s < 40) return "text-red-500";
    if (s < 70) return "text-yellow-500";
    if (s < 85) return "text-blue-500";
    return "text-green-500";
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toolbar / Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-14 h-14">
            <svg
              className="w-full h-full transform -rotate-90 drop-shadow-sm"
              viewBox="0 0 48 48"
            >
              {/* Background Circle */}
              <circle
                className="text-zinc-100"
                strokeWidth="5"
                stroke="currentColor"
                fill="transparent"
                r="20"
                cx="24"
                cy="24"
              />
              {/* Progress Circle */}
              <circle
                className={`${getScoreColor(score)} transition-all ease-out`}
                style={{ transitionDuration: "1500ms" }}
                strokeWidth="5"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * score) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="20"
                cx="24"
                cy="24"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-zinc-900">{score}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-zinc-900">
              ATS Match Score
            </span>
            <span className="text-xs font-medium text-zinc-500 mt-0.5">
              Scanned against job description
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {showPreview && (
            <Button
              className="flex-1 sm:flex-none h-10 px-5 bg-blue-600 text-white hover:bg-blue-700 shadow-sm whitespace-nowrap"
              onClick={() =>
                window.open(
                  resume?.cloudinary_url,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <span className="flex items-center justify-center">
                <Download className="w-4 h-4 mr-2 shrink-0" />
                <span>Edit in Word</span>
              </span>
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-10 px-5 text-zinc-700 border-zinc-200 hover:bg-zinc-100 shadow-sm whitespace-nowrap"
            disabled={isSaving}
            onClick={async () => {
              if (!showPreview) {
                // Switching to Preview: Apply changes first if there are edits
                if (
                  resume &&
                  editedText !== (resume.extracted_data?.text || "")
                ) {
                  setIsSaving(true);
                  try {
                    const updatedResume = await updateResume({
                      job_id: jobId,
                      old_text: resume.extracted_data?.text || "",
                      new_text: editedText,
                    });
                    setResume(updatedResume);
                  } catch (error) {
                    console.error(
                      "Failed to save resume before previewing",
                      error,
                    );
                  } finally {
                    setIsSaving(false);
                  }
                }
                setIframeLoaded(false);
                setShowPreview(true);
              } else {
                setShowPreview(false);
              }
            }}
          >
            <span className="flex items-center justify-center">
              {isSaving && !showPreview ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />{" "}
                  Applying...
                </>
              ) : showPreview ? (
                "Edit Content"
              ) : (
                "Resume Preview"
              )}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Resume Document Column */}
        <div className="lg:col-span-2 flex flex-col order-1 lg:order-2 w-full gap-6">
          {isLoading ? (
            <div className="w-full h-[600px] bg-white overflow-hidden flex flex-col relative rounded-none border border-zinc-200">
              <div className="absolute inset-0 z-0 bg-zinc-50 animate-pulse flex flex-col p-8 gap-4">
                <div className="h-8 bg-zinc-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-zinc-200 rounded w-full"></div>
                <div className="h-4 bg-zinc-200 rounded w-5/6"></div>
                <div className="h-4 bg-zinc-200 rounded w-full"></div>
                <div className="h-4 bg-zinc-200 rounded w-4/5"></div>
                <div className="h-4 bg-zinc-200 rounded w-full mt-4"></div>
                <div className="h-4 bg-zinc-200 rounded w-full"></div>
                <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : !resume ? (
            <div className="flex flex-col items-center justify-center flex-1 h-[600px] text-zinc-400 bg-zinc-50 border border-zinc-200 p-8 text-center rounded-none">
              <p className="mb-4 text-zinc-800 font-semibold text-lg">
                No tailored resume found for this job
              </p>
              <p className="text-sm max-w-md mb-6 text-zinc-500 leading-relaxed">
                Tailored resumes are generated based on the specific job
                description. Please ensure you have uploaded a primary resume in
                your settings first, then go to the Job Description tab and
                click &quot;Proceed to apply&quot; to generate a tailored copy.
              </p>
              <Button
                variant="default"
                className="rounded-none"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("switchTab", { detail: "description" }),
                  )
                }
              >
                Go to Job Description
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col w-full gap-4">
              {!showPreview ? (
                <ResumeAtsEditor
                  editedText={editedText}
                  setEditedText={setEditedText}
                  analysisData={analysisData}
                  selectedKeywordItem={selectedKeywordItem}
                />
              ) : (
                resume?.cloudinary_url && (
                  <div className="w-full h-[800px] bg-white overflow-hidden flex flex-col relative rounded-none border border-zinc-200">
                    {!iframeLoaded && (
                      <div className="absolute inset-0 z-0 bg-zinc-50 animate-pulse flex flex-col p-8 gap-4">
                        <div className="h-8 bg-zinc-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-zinc-200 rounded w-full"></div>
                        <div className="h-4 bg-zinc-200 rounded w-5/6"></div>
                        <div className="h-4 bg-zinc-200 rounded w-full"></div>
                        <div className="h-4 bg-zinc-200 rounded w-4/5"></div>
                        <div className="h-4 bg-zinc-200 rounded w-full mt-4"></div>
                        <div className="h-4 bg-zinc-200 rounded w-full"></div>
                        <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
                      </div>
                    )}
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resume.cloudinary_url)}`}
                      className={`w-full h-full border-none flex-1 bg-white relative z-10 transition-opacity duration-500 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
                      title="Resume Preview"
                      onLoad={() => setIframeLoaded(true)}
                    />
                  </div>
                )
              )}
              <div className="flex justify-between items-center w-full">
                {resume?.cloudinary_url ? (
                  <Button
                    variant="outline"
                    className="h-10 px-5 text-zinc-700 border-zinc-200 hover:bg-zinc-100 shadow-sm whitespace-nowrap"
                    onClick={() =>
                      window.open(
                        resume.cloudinary_url,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <span className="flex items-center justify-center">
                      <Download className="w-4 h-4 mr-2 shrink-0" />
                      <span>Download Resume</span>
                    </span>
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  className="h-10 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-sm whitespace-nowrap"
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await saveJobApplied({
                        job_id: jobId,
                        job_title: jobDetail?.job_title || "Unknown Title",
                        company_name:
                          jobDetail?.company_name || "Unknown Company",
                        company_logo: jobDetail?.company_logo ?? undefined,
                        job_description: jobDetail?.description ?? undefined,
                        job_type: "Full-time",
                        location: jobDetail?.location ?? undefined,
                        apply_status: "process",
                        ats_resume_id: resume?.id,
                      });
                      window.dispatchEvent(
                        new CustomEvent("switchTab", { detail: "apply" }),
                      );
                    } catch (error) {
                      console.error(
                        "Failed to save job applied tracking",
                        error,
                      );
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
                  ) : null}
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ATS Keywords Column */}
        <div className="lg:col-span-1 flex flex-col gap-6 order-2 lg:order-1">
          <AtsKeywords
            hasResume={!!resume}
            editedText={editedText}
            onAnalysisLoaded={setAnalysisData}
            selectedKeyword={selectedKeywordItem?.keyword}
            onSelectKeywordItem={(item) => setSelectedKeywordItem(item)}
            onAddKeyword={(keyword) => {
              setEditedText((prev) => {
                const spacer =
                  prev.endsWith(" ") || prev.endsWith("\n") || prev.length === 0
                    ? ""
                    : " ";
                return prev + spacer + keyword;
              });
              setSelectedKeywordItem(null);
            }}
          />
        </div>
      </div>

      {/* Sticky Confirm/Cancel Floating Bar */}
      {(editedText !== (resume?.extracted_data?.text || "") ||
        selectedKeywordItem) &&
        !showPreview && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 animate-in slide-in-from-bottom-5">
            {selectedKeywordItem && selectedKeywordItem.new_sentence && (
              <div className="bg-white border border-zinc-200 shadow-lg rounded-lg p-3 text-sm text-zinc-800 max-w-xl text-center">
                <span className="font-bold text-zinc-900 block mb-1">
                  Suggested Addition:
                </span>
                {selectedKeywordItem.new_sentence}
              </div>
            )}
            <div className="bg-white border border-zinc-200 shadow-xl rounded-full px-2 py-2 flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-700 ml-4 mr-2">
                Unsaved changes
              </span>
              <Button
                variant="ghost"
                className="rounded-full px-4"
                disabled={isSaving}
                onClick={() => {
                  setEditedText(resume?.extracted_data?.text || "");
                  setSelectedKeywordItem(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-black text-white hover:bg-zinc-800 rounded-full px-6"
                disabled={isSaving}
                onClick={async () => {
                  if (!resume || !editedText) return;
                  setIsSaving(true);
                  try {
                    const updatedResume = await updateResume({
                      job_id: jobId,
                      old_text: resume.extracted_data?.text || "",
                      new_text: editedText,
                    });
                    setResume(updatedResume);
                    setSelectedKeywordItem(null);
                  } catch (error) {
                    console.error("Failed to save resume", error);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
                ) : (
                  <Check className="w-4 h-4 mr-2 shrink-0" />
                )}
                Confirm
              </Button>
            </div>
          </div>
        )}
    </div>
  );
};
