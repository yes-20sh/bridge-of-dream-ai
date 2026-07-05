import React from "react";

export function JobFilterShimmer() {
  return (
    <div className="flex flex-col gap-6 md:gap-10 w-full animate-pulse">
      <div className="md:hidden space-y-4 w-full">
        <div className="h-6 bg-zinc-200 rounded w-48 mb-4"></div>
        <div className="h-10 bg-zinc-200 rounded-full w-full"></div>
      </div>

      <div className="space-y-4 hidden md:block">
        <div className="h-4 bg-zinc-200 rounded w-24"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-8 bg-zinc-200 rounded-full w-20"></div>
          <div className="h-8 bg-zinc-200 rounded-full w-24"></div>
          <div className="h-8 bg-zinc-200 rounded-full w-16"></div>
        </div>
      </div>

      <div className="space-y-4 hidden md:block">
        <div className="h-4 bg-zinc-200 rounded w-24"></div>
        <div className="space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-32"></div>
          <div className="h-4 bg-zinc-200 rounded w-40"></div>
          <div className="h-4 bg-zinc-200 rounded w-28"></div>
        </div>
      </div>
    </div>
  );
}
