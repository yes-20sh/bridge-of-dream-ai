import React from "react";

export function JobListShimmer() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="w-32 h-5 bg-zinc-200 animate-pulse rounded"></div>
        <div className="w-16 h-5 bg-zinc-200 animate-pulse rounded"></div>
      </div>
      <div className="flex flex-col">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between py-6 border-b border-zinc-100 -mx-4 px-4"
          >
            <div className="flex items-start gap-4 w-full">
              <div className="w-12 h-12 rounded-full bg-zinc-200 animate-pulse flex-shrink-0"></div>
              <div className="flex flex-col gap-2 w-full max-w-md">
                <div className="w-3/4 h-5 bg-zinc-200 animate-pulse rounded"></div>
                <div className="w-1/2 h-4 bg-zinc-200 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-12 ml-4">
              <div className="hidden sm:flex flex-col gap-2 w-32">
                <div className="w-20 h-4 bg-zinc-200 animate-pulse rounded"></div>
                <div className="w-24 h-3 bg-zinc-200 animate-pulse rounded"></div>
              </div>
              <div className="flex gap-4">
                <div className="w-5 h-5 bg-zinc-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
