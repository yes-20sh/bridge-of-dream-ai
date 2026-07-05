"use client";

import React, { useState, useRef, useMemo } from "react";
import mammoth from "mammoth";
import { toast } from "sonner";
import {
  UploadCloud,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Download,
  Sparkles,
  Check,
  Briefcase,
  GraduationCap,
  User,
  AlignLeft,
  FileText,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interfaces
export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  dates: string;
  description: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  dates: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
}

export type ThemeColor = "blue" | "emerald" | "indigo" | "violet" | "slate" | "amber";
export type FontFamily = "sans" | "serif" | "mono";

export interface AppearanceSettings {
  color: ThemeColor;
  font: FontFamily;
  spacing: "compact" | "normal" | "relaxed";
}

// Default Mock Data
const DEFAULT_RESUME: ResumeData = {
  personalInfo: {
    name: "John Doe",
    title: "Senior Product Designer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "Stockholm, Sweden",
    website: "johndoe.design"
  },
  experience: [
    {
      id: "1",
      company: "TechCorp Inc.",
      role: "Lead Product Designer",
      dates: "2023 - Present",
      description: [
        "Spearheaded the redesign of the core SaaS platform, increasing user engagement by 40%.",
        "Managed and mentored a team of 4 product designers.",
        "Established a comprehensive design system used across 12 product squads."
      ]
    },
    {
      id: "2",
      company: "Creative Agency",
      role: "Senior UX/UI Designer",
      dates: "2020 - 2023",
      description: [
        "Delivered end-to-end design solutions for Fortune 500 clients in fintech and e-commerce.",
        "Conducted user research and usability testing sessions with over 100 participants."
      ]
    }
  ],
  education: [
    {
      id: "1",
      school: "Design University, Stockholm",
      degree: "B.S. in Interaction Design",
      dates: "2016 - 2020"
    }
  ],
  skills: ["Figma", "Design Systems", "User Research", "Prototyping", "HTML/CSS", "React", "Interaction Design", "Wireframing"]
};

// Recommended ATS Keywords list
const ATS_KEYWORDS = [
  "A/B Testing",
  "Information Architecture",
  "Wireframing",
  "Agile Methodologies",
  "Framer",
  "Data Analytics",
  "User Personas",
  "Usability Testing",
  "Product Strategy",
  "SaaS Design",
  "Design Operations",
  "User Journeys"
];

export function ResumeEditor() {
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME);
  const [rawText, setRawText] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Appearance State
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    color: "blue",
    font: "sans",
    spacing: "normal"
  });

  // Calculate ATS score based on keywords present in the entire resumeData
  const atsScore = useMemo(() => {
    const resumeString = JSON.stringify(resumeData).toLowerCase();
    let matches = 0;
    ATS_KEYWORDS.forEach((keyword) => {
      if (resumeString.includes(keyword.toLowerCase())) {
        matches++;
      }
    });
    // Base score is 50, adding weight per keyword matched
    return Math.min(50 + matches * 4, 100);
  }, [resumeData]);

  // Handle docx file upload and parsing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "docx" && extension !== "doc") {
      toast.error("Please upload only .docx or .doc files.");
      return;
    }

    setFileName(file.name);
    setIsParsing(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          setRawText(result.value);
          const parsedData = extractResumeData(result.value, file.name);
          setResumeData(parsedData);
          toast.success("Document parsed successfully!");
        } catch (err) {
          console.error("Mammoth parsing error", err);
          toast.error("Failed to parse the DOCX file. Please edit fields manually.");
        } finally {
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        toast.error("File loading error.");
        setIsParsing(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during file upload.");
      setIsParsing(false);
    }
  };

  // Heuristic parser to load data from DOCX raw text
  const extractResumeData = (text: string, filename: string): ResumeData => {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const parsed: ResumeData = {
      personalInfo: {
        name: filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        title: "Professional Title",
        email: "",
        phone: "",
        location: "",
        website: ""
      },
      experience: [],
      education: [],
      skills: []
    };

    if (lines.length > 0) {
      // Heuristic: line 1 might be the name if it's short
      if (lines[0].length < 40 && !lines[0].includes("@")) {
        parsed.personalInfo.name = lines[0];
      }
      // Heuristic: line 2 might be the title
      if (lines[1] && lines[1].length < 50 && !lines[1].includes("@") && !lines[1].match(/\d/)) {
        parsed.personalInfo.title = lines[1];
      }
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const urlRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

    // Search for contact details
    lines.forEach((line) => {
      const emailMatch = line.match(emailRegex);
      if (emailMatch && !parsed.personalInfo.email) {
        parsed.personalInfo.email = emailMatch[0];
      }
      const phoneMatch = line.match(phoneRegex);
      if (phoneMatch && !parsed.personalInfo.phone) {
        parsed.personalInfo.phone = phoneMatch[0];
      }
      const urlMatch = line.match(urlRegex);
      if (urlMatch && !parsed.personalInfo.website && !line.includes("@")) {
        parsed.personalInfo.website = urlMatch[0];
      }
      if (line.includes(",") && !parsed.personalInfo.location && !line.includes("@") && line.length < 50) {
        const parts = line.split(",");
        if (parts.length >= 2 && parts[0].trim().length > 2 && parts[1].trim().length >= 2) {
          parsed.personalInfo.location = line;
        }
      }
    });

    // Simple Section Splitter
    let section: "experience" | "education" | "skills" | "none" = "none";
    let currentExp: Partial<WorkExperience> = {};
    let currentEdu: Partial<Education> = {};

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      if (
        lower === "experience" ||
        lower === "work experience" ||
        lower === "professional experience" ||
        lower === "employment history" ||
        lower.startsWith("experience:")
      ) {
        section = "experience";
        return;
      }
      if (
        lower === "education" ||
        lower === "academic history" ||
        lower === "academic background" ||
        lower.startsWith("education:")
      ) {
        section = "education";
        return;
      }
      if (
        lower === "skills" ||
        lower === "technical skills" ||
        lower === "key skills" ||
        lower === "competencies" ||
        lower.startsWith("skills:")
      ) {
        section = "skills";
        return;
      }

      if (section === "experience") {
        const isDate = line.match(/\b(20\d{2}|19\d{2})\b/);
        const hasDivider = line.includes("|") || line.includes("-") || line.includes(" at ");
        if (isDate && hasDivider) {
          if (currentExp.company || currentExp.role) {
            parsed.experience.push({
              id: Math.random().toString(36).substring(7),
              company: currentExp.company || "Company",
              role: currentExp.role || "Role",
              dates: currentExp.dates || "Dates",
              description: currentExp.description || []
            });
            currentExp = {};
          }
          let role = "Role";
          let company = "Company";
          if (line.includes("|")) {
            const pts = line.split("|");
            role = pts[0]?.trim() || "Role";
            company = pts[1]?.trim() || "Company";
          } else if (line.includes(" at ")) {
            const pts = line.split(" at ");
            role = pts[0]?.trim() || "Role";
            company = pts[1]?.trim() || "Company";
          }
          currentExp.role = role;
          currentExp.company = company;
          currentExp.dates = line;
          currentExp.description = [];
        } else if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
          const clean = line.replace(/^[•\-*]\s*/, "").trim();
          if (clean) {
            if (!currentExp.description) currentExp.description = [];
            currentExp.description.push(clean);
          }
        } else {
          if (!currentExp.role) {
            currentExp.role = line;
            currentExp.description = [];
          } else if (!currentExp.company) {
            currentExp.company = line;
          } else if (!currentExp.dates) {
            currentExp.dates = line;
          } else if (line.length > 40) {
            currentExp.description?.push(line);
          }
        }
      } else if (section === "education") {
        const isDate = line.match(/\b(20\d{2}|19\d{2})\b/);
        if (isDate || line.includes("University") || line.includes("College") || line.includes("School")) {
          if (currentEdu.school || currentEdu.degree) {
            parsed.education.push({
              id: Math.random().toString(36).substring(7),
              school: currentEdu.school || "School",
              degree: currentEdu.degree || "Degree",
              dates: currentEdu.dates || "Dates"
            });
            currentEdu = {};
          }
          currentEdu.school = line.includes("University") || line.includes("College") || line.includes("School") ? line : "University";
          currentEdu.degree = line.includes("Bachelor") || line.includes("Master") || line.includes("B.S.") || line.includes("M.S.") ? line : "Degree";
          currentEdu.dates = isDate ? line : "Dates";
        } else {
          if (!currentEdu.school) currentEdu.school = line;
          else if (!currentEdu.degree) currentEdu.degree = line;
          else if (!currentEdu.dates) currentEdu.dates = line;
        }
      } else if (section === "skills") {
        const items = line.split(/[;•,\-|]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 30);
        parsed.skills.push(...items);
      }
    });

    // Pushing left-over items
    if (currentExp.company || currentExp.role) {
      parsed.experience.push({
        id: Math.random().toString(36).substring(7),
        company: currentExp.company || "Company",
        role: currentExp.role || "Role",
        dates: currentExp.dates || "Dates",
        description: currentExp.description || []
      });
    }
    if (currentEdu.school || currentEdu.degree) {
      parsed.education.push({
        id: Math.random().toString(36).substring(7),
        school: currentEdu.school || "School",
        degree: currentEdu.degree || "Degree",
        dates: currentEdu.dates || "Dates"
      });
    }

    // De-duplicate and fallback structure
    parsed.skills = Array.from(new Set(parsed.skills)).slice(0, 15);
    if (parsed.skills.length === 0) parsed.skills = ["Dynamic Skills"];
    if (parsed.experience.length === 0) {
      parsed.experience = [{
        id: "1",
        company: "Extracted Experience",
        role: "Job Title",
        dates: "Dates",
        description: ["Parsed content wasn't fully structured. Review the raw text in the upload tab to copy details."]
      }];
    }
    if (parsed.education.length === 0) {
      parsed.education = [{
        id: "1",
        school: "Extracted University",
        degree: "Degree / Course",
        dates: "Dates"
      }];
    }

    return parsed;
  };

  // Live Sync handler for contentEditable
  const handleCanvasSync = (
    section: "personalInfo" | "skills",
    field: string,
    value: string
  ) => {
    if (section === "personalInfo") {
      setResumeData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value
        }
      }));
    }
  };

  const handleExperienceCanvasSync = (
    id: string,
    field: "company" | "role" | "dates",
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleExperienceBulletSync = (
    expId: string,
    bulletIndex: number,
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              description: exp.description.map((bullet, idx) =>
                idx === bulletIndex ? value : bullet
              )
            }
          : exp
      )
    }));
  };

  const handleEducationCanvasSync = (
    id: string,
    field: "school" | "degree" | "dates",
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Form manipulation actions
  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Math.random().toString(36).substring(7),
          company: "New Company",
          role: "New Role",
          dates: "2024 - Present",
          description: ["Enter accomplishment or duty here."]
        }
      ]
    }));
    toast.success("Work experience item added!");
  };

  const deleteExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id)
    }));
    toast.info("Work experience item removed");
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    const list = [...resumeData.experience];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setResumeData((prev) => ({
      ...prev,
      experience: list
    }));
  };

  const addExperienceBullet = (expId: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId
          ? { ...exp, description: [...exp.description, "New bullet point description."] }
          : exp
      )
    }));
  };

  const deleteExperienceBullet = (expId: string, bulletIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              description: exp.description.filter((_, idx) => idx !== bulletIndex)
            }
          : exp
      )
    }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Math.random().toString(36).substring(7),
          school: "New School/University",
          degree: "Degree Program",
          dates: "2020 - 2024"
        }
      ]
    }));
    toast.success("Education item added!");
  };

  const deleteEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id)
    }));
    toast.info("Education item removed");
  };

  const moveEducation = (index: number, direction: "up" | "down") => {
    const list = [...resumeData.education];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setResumeData((prev) => ({
      ...prev,
      education: list
    }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (resumeData.skills.includes(trimmed)) {
      toast.info("Skill already added");
      return;
    }
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed]
    }));
  };

  const removeSkill = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== index)
    }));
  };

  // Print PDF Trigger
  const handleDownloadPdf = () => {
    window.print();
  };

  // Reset to default mock
  const handleResetDefault = () => {
    setResumeData(DEFAULT_RESUME);
    setFileName("");
    setRawText("");
    toast.success("Reset to default profile resume!");
  };

  // Class Builders for Custom Themes
  const getThemeColorClass = () => {
    switch (appearance.color) {
      case "blue":
        return "bg-blue-600 border-blue-600 text-blue-600";
      case "emerald":
        return "bg-emerald-600 border-emerald-600 text-emerald-600";
      case "indigo":
        return "bg-indigo-600 border-indigo-600 text-indigo-600";
      case "violet":
        return "bg-violet-600 border-violet-600 text-violet-600";
      case "slate":
        return "bg-zinc-800 border-zinc-800 text-zinc-800";
      case "amber":
        return "bg-amber-600 border-amber-600 text-amber-600";
    }
  };

  const getFontFamilyClass = () => {
    switch (appearance.font) {
      case "sans":
        return "font-sans";
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
    }
  };

  const getSpacingClass = () => {
    switch (appearance.spacing) {
      case "compact":
        return "gap-3 py-1";
      case "normal":
        return "gap-5 py-2";
      case "relaxed":
        return "gap-8 py-3.5";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col font-sans">
      {/* Print-Only Style Overlay */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
            background: none !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Editor Header Toolbar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200 py-4 px-6 md:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Resume Editor
          </h1>
          <p className="text-xs font-medium text-zinc-500 mt-1">
            Build and optimize your resume. Directly edit content on the page.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 h-9 font-medium"
            onClick={handleResetDefault}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Mock Data
          </Button>
          <Button
            className="flex-1 sm:flex-none bg-zinc-900 text-white hover:bg-zinc-800 h-9 font-medium shadow"
            onClick={handleDownloadPdf}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Main Workspace Split Screen */}
      <div className="flex-1 container mx-auto px-4 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-6 no-print">
          <Card className="border-zinc-200 shadow-sm overflow-hidden">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid grid-cols-4 rounded-none border-b border-zinc-100 bg-zinc-50/50 p-0 h-12">
                <TabsTrigger
                  value="upload"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-white h-full text-xs font-semibold"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="form"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-white h-full text-xs font-semibold"
                >
                  <AlignLeft className="w-3.5 h-3.5 mr-1.5" />
                  Fields
                </TabsTrigger>
                <TabsTrigger
                  value="ats"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-white h-full text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  ATS Optimization
                </TabsTrigger>
                <TabsTrigger
                  value="design"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-white h-full text-xs font-semibold"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Theme
                </TabsTrigger>
              </TabsList>

              {/* UPLOAD TAB */}
              <TabsContent value="upload" className="p-6 focus-visible:outline-none">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-900">Upload Base Resume</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Upload your current Word resume (.docx) to automatically parse its contents and populate the editor.
                    </p>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-50/50 transition-all group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".docx"
                    />
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                      {isParsing ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <UploadCloud className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-zinc-900">
                        {fileName ? fileName : "Click to select or drop your resume"}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Accepts Microsoft Word DOCX files only
                      </p>
                    </div>
                  </div>

                  {rawText && (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-xs font-bold text-zinc-800">Raw Extracted Text</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        If parsing placed details in incorrect sections, you can reference the raw unformatted text below.
                      </p>
                      <ScrollArea className="h-[180px] w-full border border-zinc-200 rounded-lg bg-zinc-50 p-3">
                        <pre className="text-[11px] font-mono text-zinc-600 whitespace-pre-wrap leading-relaxed">
                          {rawText}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* FORM FIELDS EDITING TAB */}
              <TabsContent value="form" className="p-6 focus-visible:outline-none max-h-[600px] overflow-y-auto">
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-600">Full Name</label>
                        <Input
                          value={resumeData.personalInfo.name}
                          onChange={(e) => handleCanvasSync("personalInfo", "name", e.target.value)}
                          placeholder="John Doe"
                          className="h-8 text-xs border-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-600">Professional Title</label>
                        <Input
                          value={resumeData.personalInfo.title}
                          onChange={(e) => handleCanvasSync("personalInfo", "title", e.target.value)}
                          placeholder="Senior UX Designer"
                          className="h-8 text-xs border-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-600">Email Address</label>
                        <Input
                          value={resumeData.personalInfo.email}
                          onChange={(e) => handleCanvasSync("personalInfo", "email", e.target.value)}
                          placeholder="email@example.com"
                          className="h-8 text-xs border-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-600">Phone Number</label>
                        <Input
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => handleCanvasSync("personalInfo", "phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="h-8 text-xs border-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-600">Location</label>
                        <Input
                          value={resumeData.personalInfo.location}
                          onChange={(e) => handleCanvasSync("personalInfo", "location", e.target.value)}
                          placeholder="City, Country"
                          className="h-8 text-xs border-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-600">Portfolio Website</label>
                        <Input
                          value={resumeData.personalInfo.website}
                          onChange={(e) => handleCanvasSync("personalInfo", "website", e.target.value)}
                          placeholder="johndoe.design"
                          className="h-8 text-xs border-zinc-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div className="space-y-4 pt-2 border-t border-zinc-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        Experience
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addExperience}
                        className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Job
                      </Button>
                    </div>

                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-lg space-y-2 relative group">
                        <div className="absolute right-2 top-2 flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-zinc-400 hover:text-zinc-700"
                            disabled={index === 0}
                            onClick={() => moveExperience(index, "up")}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-zinc-400 hover:text-zinc-700"
                            disabled={index === resumeData.experience.length - 1}
                            onClick={() => moveExperience(index, "down")}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-zinc-400 hover:text-red-600"
                            onClick={() => deleteExperience(exp.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pr-16">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500">Company</label>
                            <Input
                              value={exp.company}
                              onChange={(e) => handleExperienceCanvasSync(exp.id, "company", e.target.value)}
                              className="h-7 text-xs border-zinc-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500">Role</label>
                            <Input
                              value={exp.role}
                              onChange={(e) => handleExperienceCanvasSync(exp.id, "role", e.target.value)}
                              className="h-7 text-xs border-zinc-200"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500">Duration / Dates</label>
                          <Input
                            value={exp.dates}
                            onChange={(e) => handleExperienceCanvasSync(exp.id, "dates", e.target.value)}
                            className="h-7 text-xs border-zinc-200"
                          />
                        </div>

                        {/* Bullet point details */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-bold text-zinc-500">Key Accomplishments</label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addExperienceBullet(exp.id)}
                              className="h-4 text-[9px] font-bold text-zinc-600 hover:text-blue-600 hover:bg-blue-50 px-1"
                            >
                              + Add Bullet
                            </Button>
                          </div>
                          {exp.description.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex gap-2 items-start">
                              <Textarea
                                value={bullet}
                                onChange={(e) => handleExperienceBulletSync(exp.id, bIdx, e.target.value)}
                                className="text-xs border-zinc-200 min-h-[50px] flex-1 py-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-400 hover:text-red-600 mt-1 hover:bg-red-50"
                                onClick={() => deleteExperienceBullet(exp.id, bIdx)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="space-y-4 pt-2 border-t border-zinc-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Education
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addEducation}
                        className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Edu
                      </Button>
                    </div>

                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-lg space-y-2 relative">
                        <div className="absolute right-2 top-2 flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-zinc-400 hover:text-zinc-700"
                            disabled={index === 0}
                            onClick={() => moveEducation(index, "up")}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-zinc-400 hover:text-zinc-700"
                            disabled={index === resumeData.education.length - 1}
                            onClick={() => moveEducation(index, "down")}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-zinc-400 hover:text-red-600"
                            onClick={() => deleteEducation(edu.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pr-16">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500">School</label>
                            <Input
                              value={edu.school}
                              onChange={(e) => handleEducationCanvasSync(edu.id, "school", e.target.value)}
                              className="h-7 text-xs border-zinc-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500">Degree / Focus</label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => handleEducationCanvasSync(edu.id, "degree", e.target.value)}
                              className="h-7 text-xs border-zinc-200"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500">Duration</label>
                          <Input
                            value={edu.dates}
                            onChange={(e) => handleEducationCanvasSync(edu.id, "dates", e.target.value)}
                            className="h-7 text-xs border-zinc-200"
                            placeholder="e.g. 2018 - 2022"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills tags editing */}
                  <div className="space-y-3 pt-2 border-t border-zinc-100">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Skills tags</h3>
                    <div className="flex flex-wrap gap-1.5 p-3 border border-zinc-200 bg-white rounded-lg">
                      {resumeData.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs py-0.5 px-2 bg-zinc-100 text-zinc-800 flex items-center gap-1 font-medium border border-zinc-200">
                          {skill}
                          <Button
                            variant="ghost"
                            className="h-3 w-3 p-0 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 rounded-full"
                            onClick={() => removeSkill(idx)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                      <Input
                        placeholder="Add skill..."
                        className="h-6 w-24 border-none shadow-none text-xs p-0 focus-visible:ring-0 focus-visible:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addSkill(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ATS OPTIMIZATION HELPER */}
              <TabsContent value="ats" className="p-6 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">ATS Match Calculator</h3>
                      <p className="text-xs text-zinc-500">Score adjusts as recommended keywords are added.</p>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-blue-600 flex items-center justify-center bg-blue-50/50">
                      <span className="text-xs font-black text-blue-700">{atsScore}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-700">Add Recommended Keywords</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Click any key terminology below to add it directly to your resume's skills list and increase compatibility with applicant scanners:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ATS_KEYWORDS.map((keyword) => {
                        const hasKeyword = resumeData.skills.includes(keyword);
                        return (
                          <Button
                            key={keyword}
                            variant={hasKeyword ? "secondary" : "outline"}
                            size="sm"
                            disabled={hasKeyword}
                            onClick={() => {
                              addSkill(keyword);
                              toast.success(`Keyword "${keyword}" added!`);
                            }}
                            className={`h-8 text-xs font-semibold px-3 py-1 flex items-center gap-1 border-zinc-200 ${
                              hasKeyword ? "bg-blue-50 text-blue-700 border-blue-100" : "text-zinc-700 hover:bg-zinc-50"
                            }`}
                          >
                            {hasKeyword && <Check className="w-3 h-3 text-blue-600" />}
                            {keyword}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* APPEARANCE/THEMING CONFIG TAB */}
              <TabsContent value="design" className="p-6 focus-visible:outline-none">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">Theme Palette</label>
                    <div className="grid grid-cols-6 gap-2">
                      {(["blue", "emerald", "indigo", "violet", "slate", "amber"] as ThemeColor[]).map((col) => {
                        let bg = "bg-blue-600";
                        if (col === "emerald") bg = "bg-emerald-600";
                        if (col === "indigo") bg = "bg-indigo-600";
                        if (col === "violet") bg = "bg-violet-600";
                        if (col === "slate") bg = "bg-zinc-800";
                        if (col === "amber") bg = "bg-amber-600";

                        const isActive = appearance.color === col;
                        return (
                          <button
                            key={col}
                            onClick={() => setAppearance((p) => ({ ...p, color: col }))}
                            className={`h-9 w-9 rounded-full ${bg} flex items-center justify-center transition-transform hover:scale-105 border-2 ${
                              isActive ? "border-zinc-950 scale-105 ring-2 ring-zinc-300" : "border-transparent"
                            }`}
                            title={col}
                          >
                            {isActive && <Check className="w-4 h-4 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">Font Typography</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["sans", "serif", "mono"] as FontFamily[]).map((fnt) => {
                        const isActive = appearance.font === fnt;
                        return (
                          <Button
                            key={fnt}
                            variant={isActive ? "secondary" : "outline"}
                            onClick={() => setAppearance((p) => ({ ...p, font: fnt }))}
                            className={`h-9 text-xs font-semibold capitalize border-zinc-200 ${
                              isActive ? "bg-zinc-900 text-white hover:bg-zinc-800" : "text-zinc-700"
                            }`}
                          >
                            {fnt === "sans" ? "Sans-Serif" : fnt === "serif" ? "Georgia" : "Monospace"}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">Line Spacing</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["compact", "normal", "relaxed"] as Array<"compact" | "normal" | "relaxed">).map((sp) => {
                        const isActive = appearance.spacing === sp;
                        return (
                          <Button
                            key={sp}
                            variant={isActive ? "secondary" : "outline"}
                            onClick={() => setAppearance((p) => ({ ...p, spacing: sp }))}
                            className={`h-9 text-xs font-semibold capitalize border-zinc-200 ${
                              isActive ? "bg-zinc-900 text-white hover:bg-zinc-800" : "text-zinc-700"
                            }`}
                          >
                            {sp}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Preview Sheet Canvas */}
        <div className="lg:col-span-7 flex justify-center w-full">
          <div
            id="print-area"
            className={`bg-white border border-zinc-200 shadow-lg w-full max-w-[800px] min-h-[1130px] p-12 flex flex-col relative rounded-sm ${getFontFamilyClass()}`}
          >
            {/* Theme color header line */}
            <div className={`absolute top-0 left-0 w-full h-2.5 rounded-t-sm ${getThemeColorClass().split(" ")[0]}`} />

            {/* Header info editing */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-6 mb-6">
              <div className="flex-1 pr-6">
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleCanvasSync("personalInfo", "name", e.target.innerText)}
                  className="text-3xl font-extrabold text-zinc-900 tracking-tight focus:bg-zinc-50 focus:outline-none rounded-md px-1 -ml-1 py-0.5"
                >
                  {resumeData.personalInfo.name}
                </h2>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleCanvasSync("personalInfo", "title", e.target.innerText)}
                  className={`text-base font-semibold mt-1.5 focus:bg-zinc-50 focus:outline-none rounded-md px-1 -ml-1 py-0.5 ${getThemeColorClass().split(" ")[2]}`}
                >
                  {resumeData.personalInfo.title}
                </p>
              </div>

              <div className="text-right text-xs text-zinc-500 flex flex-col gap-1 shrink-0">
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleCanvasSync("personalInfo", "email", e.target.innerText)}
                  className="focus:bg-zinc-50 focus:outline-none rounded px-1 py-0.5"
                >
                  {resumeData.personalInfo.email || "email@example.com"}
                </p>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleCanvasSync("personalInfo", "phone", e.target.innerText)}
                  className="focus:bg-zinc-50 focus:outline-none rounded px-1 py-0.5"
                >
                  {resumeData.personalInfo.phone || "+1 (555) 123-4567"}
                </p>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleCanvasSync("personalInfo", "location", e.target.innerText)}
                  className="focus:bg-zinc-50 focus:outline-none rounded px-1 py-0.5"
                >
                  {resumeData.personalInfo.location || "City, Country"}
                </p>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleCanvasSync("personalInfo", "website", e.target.innerText)}
                  className={`focus:bg-zinc-50 focus:outline-none rounded px-1 py-0.5 font-medium underline decoration-zinc-300 ${getThemeColorClass().split(" ")[2]}`}
                >
                  {resumeData.personalInfo.website || "website.com"}
                </p>
              </div>
            </div>

            {/* Structured Content Sections */}
            <div className="flex flex-col gap-6">
              {/* Experience Section */}
              <section>
                <h3 className="text-sm font-black text-zinc-950 uppercase tracking-widest border-b border-zinc-150 pb-1 mb-4">
                  Experience
                </h3>

                <div className={`flex flex-col ${getSpacingClass()}`}>
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="relative group/canvas pr-4">
                      {/* Interactive Canvas Hover Controls */}
                      <div className="absolute right-0 top-0 hidden group-hover/canvas:flex items-center gap-1 no-print">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-zinc-100"
                          onClick={() => deleteExperience(exp.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-zinc-500 hover:text-red-600" />
                        </Button>
                      </div>

                      <div className="flex justify-between items-baseline mb-1">
                        <h4
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleExperienceCanvasSync(exp.id, "role", e.target.innerText)}
                          className="font-black text-zinc-900 text-sm focus:bg-zinc-50 focus:outline-none rounded px-0.5 -ml-0.5"
                        >
                          {exp.role}
                        </h4>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleExperienceCanvasSync(exp.id, "dates", e.target.innerText)}
                          className="text-xs text-zinc-500 font-medium focus:bg-zinc-50 focus:outline-none rounded px-0.5"
                        >
                          {exp.dates}
                        </span>
                      </div>

                      <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleExperienceCanvasSync(exp.id, "company", e.target.innerText)}
                        className="text-xs font-semibold text-zinc-700 mb-2 focus:bg-zinc-50 focus:outline-none rounded px-0.5 -ml-0.5"
                      >
                        {exp.company}
                      </p>

                      <ul className="list-disc list-outside ml-4 text-xs text-zinc-650 space-y-1.5 leading-relaxed">
                        {exp.description.map((bullet, bIdx) => (
                          <li
                            key={bIdx}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleExperienceBulletSync(exp.id, bIdx, e.target.innerText)}
                            className="focus:bg-zinc-50 focus:outline-none rounded px-0.5"
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education Section */}
              <section>
                <h3 className="text-sm font-black text-zinc-950 uppercase tracking-widest border-b border-zinc-150 pb-1 mb-4">
                  Education
                </h3>

                <div className={`flex flex-col ${getSpacingClass()}`}>
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="relative group/edu-canvas pr-4">
                      {/* Interactive Canvas Hover Controls */}
                      <div className="absolute right-0 top-0 hidden group-hover/edu-canvas:flex items-center no-print">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-zinc-100"
                          onClick={() => deleteEducation(edu.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-zinc-500 hover:text-red-600" />
                        </Button>
                      </div>

                      <div className="flex justify-between items-baseline mb-1">
                        <h4
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleEducationCanvasSync(edu.id, "school", e.target.innerText)}
                          className="font-black text-zinc-900 text-sm focus:bg-zinc-50 focus:outline-none rounded px-0.5 -ml-0.5"
                        >
                          {edu.school}
                        </h4>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleEducationCanvasSync(edu.id, "dates", e.target.innerText)}
                          className="text-xs text-zinc-500 font-medium focus:bg-zinc-50 focus:outline-none rounded px-0.5"
                        >
                          {edu.dates}
                        </span>
                      </div>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleEducationCanvasSync(edu.id, "degree", e.target.innerText)}
                        className="text-xs font-semibold text-zinc-650 focus:bg-zinc-50 focus:outline-none rounded px-0.5 -ml-0.5"
                      >
                        {edu.degree}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Skills Tags Section */}
              <section>
                <h3 className="text-sm font-black text-zinc-950 uppercase tracking-widest border-b border-zinc-150 pb-1 mb-4">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {resumeData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-zinc-100 text-zinc-800 text-xs px-3 py-1.5 rounded font-medium border border-zinc-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
