import React, { useRef } from "react";

import { KeywordAnalysisItem } from "@/api/ResumeAtsApi/analyzeKeywords";

interface ResumeAtsEditorProps {
  editedText: string;
  setEditedText: (text: string) => void;
  analysisData?: KeywordAnalysisItem[];
  selectedKeywordItem?: KeywordAnalysisItem | null;
}

export const ResumeAtsEditor = ({ editedText, setEditedText, analysisData = [], selectedKeywordItem }: ResumeAtsEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const highlightKeywords = (text: string) => {
    if (!text) return null;
    
    // We want to highlight all matched keywords from analysisData
    const keywords = analysisData
      .filter((k) => k.is_matching || text.toLowerCase().includes(k.keyword.toLowerCase()))
      .map((k) => k.keyword);

    const oldSentence = selectedKeywordItem?.old_sentence;
    const allMatches = [...keywords];
    if (oldSentence) {
      allMatches.push(oldSentence);
    }

    if (allMatches.length === 0) return <span>{text}</span>;

    // Sort by length descending to match longest phrases first
    allMatches.sort((a, b) => b.length - a.length);

    const escapedKeywords = allMatches.map((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return `(?<!\\w)${escaped}(?!\\w)`;
    });
    const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");

    const parts = text.split(regex);

    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase();
      
      // Check if it's the old sentence
      if (oldSentence && lowerPart === oldSentence.toLowerCase()) {
        return (
          <mark key={i} className="underline decoration-red-500 decoration-[2px] underline-offset-4 bg-transparent text-transparent">
            {part}
          </mark>
        );
      }

      // Check if it's a keyword
      const matchedKeyword = analysisData.find((k) => k.keyword.toLowerCase() === lowerPart);
      if (matchedKeyword) {
        let decorationColor = "decoration-zinc-400";
        let bgColor = "bg-zinc-200/50";
        if (matchedKeyword.priority.toLowerCase() === 'high') {
          decorationColor = "decoration-green-500";
          bgColor = "bg-green-100/50";
        } else if (matchedKeyword.priority.toLowerCase() === 'medium') {
          decorationColor = "decoration-yellow-500";
          bgColor = "bg-yellow-100/50";
        } else if (matchedKeyword.priority.toLowerCase() === 'low') {
          decorationColor = "decoration-blue-500";
          bgColor = "bg-blue-100/50";
        }

        return (
          <mark key={i} className={`underline ${decorationColor} decoration-[2px] underline-offset-4 ${bgColor} text-transparent rounded-sm px-0.5`}>
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="relative w-full h-[600px] bg-white border border-zinc-200 shadow-sm rounded-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-hidden">
      {/* Backdrop for highlighting */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        className="absolute inset-0 p-6 text-base font-mono whitespace-pre-wrap break-words overflow-auto pointer-events-none text-transparent leading-normal tracking-normal [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {highlightKeywords(editedText)}
        <br />
      </div>
      {/* Actual textarea */}
      <textarea
        ref={textareaRef}
        onScroll={handleScroll}
        className="absolute inset-0 w-full h-full p-6 text-base font-mono bg-transparent text-zinc-700 border-none outline-none resize-none leading-normal tracking-normal m-0"
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        placeholder="Paste or type your resume content here..."
        spellCheck="false"
      />
    </div>
  );
};
