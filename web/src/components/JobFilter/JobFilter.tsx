"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Internship",
  "Student",
  "Co founder",
  "Volunteer",
];

const JOB_ROLES = [
  { id: "role-1", label: "User experience" },
  { id: "role-2", label: "Interaction designer", defaultChecked: true },
  { id: "role-3", label: "User interface designer" },
  { id: "role-4", label: "Creative director" },
  { id: "role-5", label: "Product designer", defaultChecked: true },
  { id: "role-6", label: "Motion graphics designer" },
];

const LOCATIONS = [
  { id: "loc-1", label: "Stockholm", defaultChecked: true },
  { id: "loc-2", label: "Gothenburg" },
  { id: "loc-3", label: "Malmö" },
  { id: "loc-4", label: "Upsalla" },
];

const COMPANIES = [
  { id: "comp-1", label: "Google" },
  { id: "comp-2", label: "Amazon" },
  { id: "comp-3", label: "Microsoft" },
  { id: "comp-4", label: "Meta" },
  { id: "comp-5", label: "Apple" },
  { id: "comp-6", label: "Stripe" },
];

const DURATIONS = [
  { id: "day", label: "24 hour" },
  { id: "week", label: "1 week" },
  { id: "month", label: "1 month" },
];

export interface JobFilterData {
  jobRoles?: string[] | null;
  jobTypes?: string[] | null;
  locations?: string[] | null;
  companies?: string[] | null;
}

export function JobFilter({
  initialData,
}: {
  initialData?: JobFilterData | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasApiTypes = initialData?.jobTypes && initialData.jobTypes.length > 0;
  const availableTypes = hasApiTypes ? initialData.jobTypes! : JOB_TYPES;

  const hasApiRoles = initialData?.jobRoles && initialData.jobRoles.length > 0;
  const availableRoles = hasApiRoles
    ? initialData.jobRoles!.map((r) => ({ id: r, label: r }))
    : JOB_ROLES;

  const hasApiLocations =
    initialData?.locations && initialData.locations.length > 0;
  const availableLocations = hasApiLocations
    ? initialData.locations!.map((l) => ({ id: l, label: l }))
    : LOCATIONS;

  const hasApiCompanies =
    initialData?.companies && initialData.companies.length > 0;
  const availableCompanies = hasApiCompanies
    ? initialData.companies!.map((c) => ({ id: c, label: c }))
    : COMPANIES;

  const getInitialTypes = () => {
    const val = searchParams.get("job_types");
    return val ? val.split(",") : [];
  };
  const getInitialRoles = () => {
    const val = searchParams.get("job_roles");
    return val ? val.split(",") : [];
  };
  const getInitialLocations = () => {
    const val = searchParams.get("locations");
    return val ? val.split(",") : [];
  };
  const getInitialCompanies = () => {
    const val = searchParams.get("companies");
    return val ? val.split(",") : [];
  };
  const getInitialDurations = () => {
    const val = searchParams.get("duration");
    return val ? [val] : [];
  };

  const [selectedTypes, setSelectedTypes] =
    useState<string[]>(getInitialTypes());
  const [selectedRoles, setSelectedRoles] =
    useState<string[]>(getInitialRoles());
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    getInitialLocations(),
  );
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(
    getInitialCompanies(),
  );
  const [selectedDurations, setSelectedDurations] = useState<string[]>(
    getInitialDurations(),
  );

  const [activeMobileTab, setActiveMobileTab] = useState("Job Types");

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleRole = (id: string) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const toggleLocation = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const toggleCompany = (id: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleDuration = (id: string) => {
    setSelectedDurations((prev) =>
      prev.includes(id) ? [] : [id]
    );
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    const setOrDelete = (key: string, arr: string[]) => {
      if (arr.length > 0) {
        params.set(key, arr.join(","));
      } else {
        params.delete(key);
      }
    };
    
    setOrDelete("job_types", selectedTypes);
    setOrDelete("job_roles", selectedRoles);
    setOrDelete("locations", selectedLocations);
    setOrDelete("companies", selectedCompanies);
    setOrDelete("duration", selectedDurations);
    
    params.delete("page");

    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  const hasChanges =
    JSON.stringify([...selectedTypes].sort()) !==
      JSON.stringify([...getInitialTypes()].sort()) ||
    JSON.stringify([...selectedRoles].sort()) !==
      JSON.stringify([...getInitialRoles()].sort()) ||
    JSON.stringify([...selectedLocations].sort()) !==
      JSON.stringify([...getInitialLocations()].sort()) ||
    JSON.stringify([...selectedCompanies].sort()) !==
      JSON.stringify([...getInitialCompanies()].sort()) ||
    selectedDurations.length > 0;

  const totalFilters =
    selectedTypes.length +
    selectedRoles.length +
    selectedLocations.length +
    selectedCompanies.length +
    selectedDurations.length;

  const renderJobTypes = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-zinc-900 text-sm hidden md:block">
        Job types
      </h3>
      <div className="flex flex-wrap gap-2">
        {availableTypes.map((type) => {
          const isSelected = selectedTypes.includes(type);
          return (
            <Badge
              key={type}
              onClick={() => toggleType(type)}
              variant={isSelected ? "default" : "outline"}
              className={`px-4 py-1.5 rounded-full font-medium cursor-pointer transition-all active:scale-95 ${
                isSelected
                  ? "bg-black hover:bg-black text-white"
                  : "text-zinc-500 border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 hover:text-zinc-700"
              }`}
            >
              {type}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  const renderJobRoles = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-zinc-900 text-sm hidden md:block">
        Job roles
      </h3>
      <div className="space-y-3">
        {availableRoles.map((role) => (
          <div key={role.id} className="flex items-center space-x-3">
            <Checkbox
              id={role.id}
              checked={selectedRoles.includes(role.id)}
              onCheckedChange={() => toggleRole(role.id)}
              className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <label
              htmlFor={role.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-600 cursor-pointer"
            >
              {role.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-zinc-900 text-sm hidden md:block">
        Location
      </h3>
      <div className="space-y-3">
        {availableLocations.map((loc) => (
          <div key={loc.id} className="flex items-center space-x-3">
            <Checkbox
              id={loc.id}
              checked={selectedLocations.includes(loc.id)}
              onCheckedChange={() => toggleLocation(loc.id)}
              className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <label
              htmlFor={loc.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-600 cursor-pointer"
            >
              {loc.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompanies = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-zinc-900 text-sm hidden md:block">
        Companies
      </h3>
      <div className="space-y-3">
        {availableCompanies.map((comp) => (
          <div key={comp.id} className="flex items-center space-x-3">
            <Checkbox
              id={comp.id}
              checked={selectedCompanies.includes(comp.id)}
              onCheckedChange={() => toggleCompany(comp.id)}
              className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <label
              htmlFor={comp.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-600 cursor-pointer"
            >
              {comp.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDurations = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-zinc-900 text-sm hidden md:block">
        Duration
      </h3>
      <div className="space-y-3">
        {DURATIONS.map((duration) => (
          <div key={duration.id} className="flex items-center space-x-3">
            <Checkbox
              id={duration.id}
              checked={selectedDurations.includes(duration.id)}
              onCheckedChange={() => toggleDuration(duration.id)}
              className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <label
              htmlFor={duration.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-600 cursor-pointer"
            >
              {duration.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const mobileTabs = [
    "Job Types",
    "Job Roles",
    "Location",
    "Companies",
    "Duration",
  ];

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-10">
        {/* Mobile Header & Carousel */}
        <div className="md:hidden space-y-4 w-full">
          <Carousel opts={{ align: "start" }} className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-bold text-zinc-900">
                Filter your preferences
              </h2>
              <div className="flex items-center gap-2">
                <CarouselPrevious className="static transform-none h-8 w-8 m-0" />
                <CarouselNext className="static transform-none h-8 w-8 m-0" />
              </div>
            </div>

            <div className="w-full">
              <CarouselContent className="-ml-2">
                {mobileTabs.map((tab) => (
                  <CarouselItem key={tab} className="basis-auto pl-2">
                    <Button
                      variant={activeMobileTab === tab ? "default" : "outline"}
                      onClick={() => setActiveMobileTab(tab)}
                      className={`rounded-full px-4 h-9 ${
                        activeMobileTab === tab
                          ? "bg-black text-white hover:bg-black"
                          : "text-zinc-600 border-zinc-200"
                      }`}
                    >
                      {tab}
                    </Button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>
          </Carousel>
        </div>

        {/* Mobile Active Section Content */}
        <div className="md:hidden mt-2">
          {activeMobileTab === "Job Types" && renderJobTypes()}
          {activeMobileTab === "Job Roles" && renderJobRoles()}
          {activeMobileTab === "Location" && renderLocations()}
          {activeMobileTab === "Companies" && renderCompanies()}
          {activeMobileTab === "Duration" && renderDurations()}
        </div>

        {/* Desktop All Sections */}
        <div className="hidden md:flex flex-col gap-10">
          {renderJobTypes()}
          {renderJobRoles()}
          {renderLocations()}
          {renderCompanies()}
          {renderDurations()}
        </div>
      </div>

      {/* Sticky Bottom Apply Button */}
      {hasChanges && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <Button 
            onClick={handleApply}
            className="rounded-full shadow-2xl px-8 h-10 text-sm font-semibold bg-black hover:bg-zinc-800 text-white transition-transform hover:scale-105 active:scale-95"
          >
            Apply {totalFilters} {totalFilters === 1 ? "Filter" : "Filters"}
          </Button>
        </div>
      )}
    </>
  );
}

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
