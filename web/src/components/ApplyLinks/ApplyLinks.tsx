import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight, Layers, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ApplyLinkItem } from "@/api/ApplyLinksApi/searchApplyLinks";
import { updateApplyStatus } from "@/api/ApplyLinksApi/updateApplyStatus";

export interface ApplyLinksProps {
  jobId: string;
  companyName: string;
  jobTitle: string;
  links: ApplyLinkItem[];
  isLoading: boolean;
}

const getIconForPlatform = (platform: string) => {
  const p = platform.toLowerCase();
  if (p === "linkedin") {
    return <FileText className="w-5 h-5 text-blue-600" />;
  }
  if (p === "indeed") {
    return <Layers className="w-5 h-5 text-indigo-600" />;
  }
  if (p === "glassdoor") {
    return <ArrowRight className="w-5 h-5 text-teal-600" />;
  }
  return <ArrowRight className="w-5 h-5 text-zinc-600" />;
};

const isJobBoard = (platform: string) => {
  const p = platform.toLowerCase();
  return ["linkedin", "indeed", "glassdoor", "ziprecruiter", "simplyhired"].includes(p);
};

const PlatformIcon = ({ link }: { link: ApplyLinkItem }) => {
  const [imgError, setImgError] = useState(false);
  
  if (imgError || !link.logo) {
    return getIconForPlatform(link.platform);
  }
  
  return (
    <img 
      src={link.logo} 
      alt={link.platform} 
      className="w-5 h-5 object-contain"
      onError={() => setImgError(true)}
    />
  );
};

export const ApplyLinks = ({ jobId, companyName, jobTitle, links, isLoading }: ApplyLinksProps) => {
  const [prevLinks, setPrevLinks] = useState<ApplyLinkItem[]>(links);
  const [appliedStatus, setAppliedStatus] = useState<Record<string, string>>(() => {
    const initialStatuses: Record<string, string> = {};
    links?.forEach((link) => {
      initialStatuses[link.url] = link.status || "not_applied";
    });
    return initialStatuses;
  });

  if (links !== prevLinks) {
    setPrevLinks(links);
    const initialStatuses: Record<string, string> = {};
    links?.forEach((link) => {
      initialStatuses[link.url] = link.status || "not_applied";
    });
    setAppliedStatus(initialStatuses);
  }

  const handleOpenAll = () => {
    links.forEach((link) => {
      window.open(link.url, "_blank");
    });
  };

  const handleStatusChange = async (platform: string, url: string, value: string, title: string) => {
    // Optimistic UI update
    setAppliedStatus((prev) => ({
      ...prev,
      [url]: value
    }));
    
    try {
      await updateApplyStatus(jobId, platform, url, value);
      
      if (value === "applied") {
        toast.success(`Marked "${title}" as Applied!`);
        window.dispatchEvent(new CustomEvent("unlockAllTabs"));
      } else if (value === "interviewing") {
        toast.success(`Marked "${title}" as Interviewing!`);
      } else if (value === "offer") {
        toast.success(`Congratulations! Marked "${title}" as Offer Received!`);
      } else if (value === "rejected") {
        toast.error(`Marked "${title}" as Rejected.`);
      } else {
        toast.info(`Reset "${title}" application status.`);
      }
    } catch (err) {
      console.error("Failed to update apply status in DB:", err);
      toast.error("Failed to save application status. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 mb-12 animate-pulse">
        {/* Header Loading Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-zinc-200 shadow-sm">
          <div className="flex-1">
            <Skeleton className="h-7 w-48 mb-2 bg-zinc-200" />
            <Skeleton className="h-4 w-72 bg-zinc-200" />
          </div>
          <Skeleton className="h-10 w-36 bg-zinc-200 shrink-0" />
        </div>

        {/* Card Loading Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((idx) => (
            <Card key={idx} className="rounded-none border border-zinc-200 p-6 flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 bg-zinc-200 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-36 mb-2 bg-zinc-200" />
                  <Skeleton className="h-4 w-full mb-1 bg-zinc-200" />
                  <Skeleton className="h-4 w-2/3 bg-zinc-200" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-9 flex-1 bg-zinc-200" />
                <Skeleton className="h-9 flex-1 bg-zinc-200" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-zinc-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950">Application Channels</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Apply through multiple routes to maximize your response rate and follow up.
          </p>
        </div>
        <Button
          onClick={handleOpenAll}
          variant="default"
          className="rounded-none bg-zinc-900 text-white hover:bg-zinc-800 transition-all font-medium shrink-0"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open All Links
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link) => {
          const currentStatus = appliedStatus[link.url] || "not_applied";
          
          return (
            <Card 
              key={link.url}
              className="rounded-none border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-4">
                <div className="p-3 bg-zinc-50 border border-zinc-100 shrink-0">
                  <PlatformIcon link={link} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg font-bold text-zinc-950 truncate group-hover:text-blue-600 transition-colors">
                      {link.platform}
                    </CardTitle>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-zinc-100 text-zinc-600 shrink-0">
                      {isJobBoard(link.platform) ? "Job Board" : "Direct"}
                    </span>
                  </div>
                  <CardDescription className="text-zinc-500 text-sm leading-relaxed">
                    {link.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-6 px-6 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-none border-zinc-200 group-hover:border-zinc-400 group-hover:bg-zinc-50 text-zinc-700 text-xs font-semibold h-9"
                  onClick={() => window.open(link.url, "_blank")}
                >
                  Go to Portal
                  <ExternalLink className="w-3.5 h-3.5 ml-2 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
                </Button>
                <div className="flex-1">
                  <Select
                    value={currentStatus}
                    onValueChange={(val) => handleStatusChange(link.platform || "", link.url || "", val || "", link.platform || "")}
                  >
                    <SelectTrigger className={`w-full rounded-none h-9 border-zinc-200 text-xs font-semibold text-zinc-700 focus:ring-0 focus:ring-offset-0 ${
                      currentStatus === "applied" ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100/50" : 
                      currentStatus === "interviewing" ? "border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100/50" :
                      currentStatus === "offer" ? "border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/50" :
                      currentStatus === "rejected" ? "border-red-600 bg-red-50 text-red-700 hover:bg-red-100/50" : ""
                    }`}>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="not_applied" className="text-xs">Not Applied</SelectItem>
                      <SelectItem value="applied" className="text-xs font-semibold text-green-700">Applied</SelectItem>
                      <SelectItem value="interviewing" className="text-xs font-semibold text-blue-700">Interviewing</SelectItem>
                      <SelectItem value="offer" className="text-xs font-semibold text-emerald-700">Offer Received</SelectItem>
                      <SelectItem value="rejected" className="text-xs font-semibold text-red-600">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end mt-4 pt-6 border-t border-zinc-200">
        <Button
          className="h-10 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-sm whitespace-nowrap"
          disabled={!Object.values(appliedStatus).includes("applied")}
          onClick={() => {
            window.dispatchEvent(new CustomEvent("switchTab", { detail: "connections" }));
          }}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};
