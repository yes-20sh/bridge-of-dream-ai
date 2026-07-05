"use client";

import React, { useState, useEffect } from "react";
import { Grid, List, Mail, Phone, Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getConnections, ConnectionDto } from "@/api/ConnectionsApi/getConnections";
import { saveConnection } from "@/api/ConnectionsApi/saveConnection";
import { getSavedConnections } from "@/api/ConnectionsApi/getSavedConnections";
import { getConnectionsByCompany } from "@/api/ConnectionsApi/getConnectionsByCompany";

function Linkedin(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function getLogoColor(name: string): string {
  const colors = [
    "bg-[#1DB954]", // Spotify Green
    "bg-[#FFB3C6]", // Pink
    "bg-[#FF9B71]", // Orange
    "bg-[#111111]", // Black
    "bg-[#FF4D4D]", // Red
    "bg-[#253B59]", // Dark Blue
    "bg-indigo-600",
    "bg-purple-600",
    "bg-teal-600"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function NetworkListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="w-5 h-5" />
        </div>
      </div>

      {/* List items skeleton */}
      <div className="flex flex-col">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-start sm:items-center justify-between py-6 border-b border-zinc-100 -mx-4 px-4"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-12 ml-4">
              <div className="hidden sm:block w-32">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="w-4 h-4 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface NetworkListProps {
  companyName?: string;
  showNextStep?: boolean;
}

export function NetworkList({ companyName = "", showNextStep = false }: NetworkListProps) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [connections, setConnections] = useState<ConnectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedLinks, setSavedLinks] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<"connections" | "find">("connections");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConnections = connections.filter((contact) => {
    if (activeTab === "connections" || !searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(q) ||
      contact.job.toLowerCase().includes(q) ||
      contact.company.toLowerCase().includes(q) ||
      contact.location.toLowerCase().includes(q)
    );
  });

  // Load saved connection links from DB on mount
  useEffect(() => {
    async function loadSavedFromDb() {
      try {
        const res = await getSavedConnections(1, 100);
        const links = res.data.map((conn) => conn.linkedin_link);
        setSavedLinks(links);
      } catch (err) {
        console.error("Failed to load saved connections from database", err);
      }
    }
    loadSavedFromDb();
  }, []);

  const handleToggleSave = async (e: React.MouseEvent, contact: ConnectionDto) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isSaved = savedLinks.includes(contact.linkedin_link);
    try {
      // Optimistic state update
      if (isSaved) {
        setSavedLinks((prev) => prev.filter((l) => l !== contact.linkedin_link));
      } else {
        setSavedLinks((prev) => [...prev, contact.linkedin_link]);
      }

      const res = await saveConnection({
        target_linkedin_url: "https://www.linkedin.com/in/yes20sh/",
        name: contact.name,
        profile: contact.profile,
        job: contact.job,
        company: contact.company,
        location: contact.location,
        email: contact.email,
        number: contact.number,
        lprofile: contact.lprofile,
        linkedin_link: contact.linkedin_link
      });
      toast.success(res.message);

      // If active tab is connections (the saved list), and we just unsaved it, remove it from list
      if (activeTab === "connections" && isSaved) {
        setConnections((prev) => prev.filter((c) => c.linkedin_link !== contact.linkedin_link));
      }
    } catch (err) {
      // Rollback on error
      if (isSaved) {
        setSavedLinks((prev) => [...prev, contact.linkedin_link]);
      } else {
        setSavedLinks((prev) => prev.filter((l) => l !== contact.linkedin_link));
      }
      toast.error("Failed to update saved connection");
    }
  };

  useEffect(() => {
    async function loadTabContent() {
      try {
        setIsLoading(true);
        setError(null);
        setPage(1);
        setSearchQuery("");

        if (activeTab === "connections") {
          const res = companyName 
            ? await getConnectionsByCompany(companyName, 1, 10)
            : await getSavedConnections(1, 10);
          if (res.data.length === 0) {
            setActiveTab("find");
            return;
          }
          setConnections(res.data);
          setTotalPages(res.total_pages);
        } else {
          if (!companyName) {
            setConnections([]);
            setTotalPages(1);
            setIsLoading(false);
            return;
          }
          const res = await getConnections(companyName, 1, 10);
          setConnections(res.data);
          setTotalPages(res.total_pages);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to retrieve connections";
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { data?: { detail?: string } } };
          setError(axiosError.response?.data?.detail || errorMessage);
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadTabContent();
  }, [activeTab, companyName]);

  const handleLoadMore = async () => {
    if (isFetchingMore || page >= totalPages) return;
    try {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      let res;
      if (activeTab === "connections") {
        res = companyName
          ? await getConnectionsByCompany(companyName, nextPage, 10)
          : await getSavedConnections(nextPage, 10);
      } else {
        res = await getConnections(companyName, nextPage, 10);
      }
      setConnections((prev) => [...prev, ...res.data]);
      setPage(nextPage);
      setTotalPages(res.total_pages);
    } catch (err) {
      toast.error("Failed to load more connections");
    } finally {
      setIsFetchingMore(false);
    }
  };

  if (isLoading) {
    return <NetworkListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50/50 rounded-2xl border border-red-100 p-8">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 font-bold text-xl">!</div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">Scraping Failed</h3>
        <p className="text-sm text-zinc-655 text-red-700 max-w-md mb-6">{error}</p>
        <div className="text-xs text-zinc-400">
          Tip: LinkedIn anonymous scraping is highly rate-limited and protected by login walls.
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">No connections found</h3>
        <p className="text-zinc-500 max-w-sm">
          We couldn&apos;t find any public connections matching &quot;{companyName}&quot; on this profile page.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setActiveTab("connections");
              setSearchQuery("");
            }}
            className={`text-sm font-semibold pb-1 transition-all border-b-2 ${
              activeTab === "connections"
                ? "text-black border-black"
                : "text-zinc-400 border-transparent hover:text-zinc-600"
            }`}
          >
            Connections
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("find")}
              className={`text-sm font-semibold pb-1 transition-all border-b-2 ${
                activeTab === "find"
                  ? "text-black border-black"
                  : "text-zinc-400 border-transparent hover:text-zinc-600"
              }`}
            >
              Find by
            </button>
            {activeTab === "find" && (
              <input
                type="text"
                placeholder="Name, job, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm bg-transparent border-b border-zinc-300 focus:border-black focus:outline-none px-2 py-0.5 w-36 sm:w-48 transition-all animate-in fade-in slide-in-from-left-2 duration-200"
                autoFocus
              />
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-zinc-400 self-end sm:self-auto">
          <Grid
            onClick={() => setView("grid")}
            className={`w-5 h-5 cursor-pointer transition-colors ${view === "grid" ? "text-black" : "hover:text-black"}`}
          />
          <List
            onClick={() => setView("list")}
            className={`w-5 h-5 cursor-pointer transition-colors ${view === "list" ? "text-black" : "hover:text-black"}`}
          />
        </div>
      </div>

      {/* Conditional Rendering for List vs Grid */}
      {filteredConnections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/30">
          <p className="text-zinc-500 text-sm">No connections match your search query.</p>
        </div>
      ) : view === "list" ? (
        <div className="flex flex-col">
          {filteredConnections.map((contact) => (
            <div
              key={contact.id}
              className="group flex items-start sm:items-center justify-between py-6 border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors -mx-4 px-4 rounded-xl"
            >
              <div className="flex items-start gap-4">
                {/* Logo Placeholder */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${getLogoColor(contact.name)}`}
                >
                  {contact.profile}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1">
                  <h4 className="font-semibold text-zinc-900 text-base flex items-center gap-2">
                    {contact.name}
                    <span className="text-xs font-normal text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                      {contact.lprofile} referral
                    </span>
                  </h4>
                  <p className="text-sm text-zinc-500">{contact.job}</p>
                </div>
              </div>

              <div className="flex items-center gap-12 ml-4">
                {/* Location */}
                <div className="hidden sm:flex flex-col gap-1 w-32">
                  <span className="text-xs text-zinc-500">
                    {contact.location}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 text-zinc-400">
                  <a href={`mailto:${contact.email}`} title={contact.email}>
                    <Mail className="w-4 h-4 cursor-pointer hover:text-black transition-colors" />
                  </a>
                  <a href={contact.linkedin_link} target="_blank" rel="noopener noreferrer" title="View LinkedIn Profile">
                    <Linkedin className="w-4 h-4 cursor-pointer hover:text-[#0A66C2] transition-colors" />
                  </a>
                  <a href={`tel:${contact.number}`} title={contact.number}>
                    <Phone className="w-4 h-4 cursor-pointer hover:text-green-600 transition-colors" />
                  </a>
                  <Bookmark
                    onClick={(e) => handleToggleSave(e, contact)}
                    className={`w-4 h-4 cursor-pointer transition-all ${
                      savedLinks.includes(contact.linkedin_link)
                        ? "fill-black text-black scale-110"
                        : "hover:text-black hover:scale-105"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {filteredConnections.map((contact) => (
            <div
              key={contact.id}
              className="group flex flex-col justify-between p-6 border border-zinc-200 hover:shadow-xl hover:border-zinc-300 transition-all rounded-2xl bg-white"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${getLogoColor(contact.name)}`}
                >
                  {contact.profile}
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <a href={`mailto:${contact.email}`} title={contact.email}>
                    <Mail className="w-4 h-4 cursor-pointer hover:text-black transition-colors" />
                  </a>
                  <a href={contact.linkedin_link} target="_blank" rel="noopener noreferrer" title="View LinkedIn Profile">
                    <Linkedin className="w-4 h-4 cursor-pointer hover:text-[#0A66C2] transition-colors" />
                  </a>
                  <a href={`tel:${contact.number}`} title={contact.number}>
                    <Phone className="w-4 h-4 cursor-pointer hover:text-green-600 transition-colors" />
                  </a>
                  <Bookmark
                    onClick={(e) => handleToggleSave(e, contact)}
                    className={`w-4 h-4 cursor-pointer transition-all ${
                      savedLinks.includes(contact.linkedin_link)
                        ? "fill-black text-black scale-110"
                        : "hover:text-black hover:scale-105"
                    }`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <h4 className="font-semibold text-zinc-900 text-lg leading-snug flex items-center gap-2">
                  {contact.name}
                </h4>
                <p className="text-sm text-zinc-500">{contact.job}</p>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-zinc-100 mt-auto">
                <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                  {contact.lprofile} referral
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  {contact.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {connections.length >= 10 * page && !isLoading && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleLoadMore}
            disabled={isFetchingMore}
            variant="outline"
            className="rounded-full px-6 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            {isFetchingMore ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin"></span>
                Loading...
              </span>
            ) : (
              "More results"
            )}
          </Button>
        </div>
      )}

      {showNextStep && (
        <div className="flex justify-end mt-8 pt-6 border-t border-zinc-200">
          <Button
            className="h-10 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-sm whitespace-nowrap"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("switchTab", { detail: "status" }));
            }}
          >
            Finish & Review Status
          </Button>
        </div>
      )}
    </>
  );
}
