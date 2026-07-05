"use client";

import React, { useState } from "react";
import { Activity, Edit2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INITIAL_APPLICATIONS = [
  {
    id: 1,
    lastUpdateDate: "Jul 01, 2026",
    sourceName: "Jane Doe (Design Lead)",
    source: "Referral",
    status: "Interview Scheduled",
  },
  {
    id: 2,
    lastUpdateDate: "Jun 28, 2026",
    sourceName: "careers.google.com",
    source: "Company Site",
    status: "Resume Under Review",
  },
  {
    id: 3,
    lastUpdateDate: "Jun 20, 2026",
    sourceName: "LinkedIn Easy Apply",
    source: "LinkedIn",
    status: "Application Submitted",
  },
];

const STATUS_OPTIONS = [
  "Application Submitted",
  "Resume Under Review",
  "Interview Scheduled",
  "Offer Received",
  "Rejected",
];

export const ApplicationTracker = () => {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

  const handleStatusChange = (id: number, newStatus: string) => {
    setApplications((apps) =>
      apps.map((app) => (app.id === id ? { ...app, status: newStatus } : app)),
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">
            Your Applications
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Track all your submissions for this role.
          </p>
        </div>
        <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </div>

      <div className="flex flex-col bg-white border border-zinc-200 rounded-2xl p-4 sm:p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Table/List Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 px-4 text-sm font-semibold text-zinc-500">
            <div className="w-1/4">Last Update Date</div>
            <div className="w-1/4">Source Name</div>
            <div className="w-1/4">Source</div>
            <div className="w-1/4">Status</div>
            <div className="w-24 text-right">Actions</div>
          </div>

          {/* List Items */}
          <div className="flex flex-col">
            {applications.map((app, idx) => (
              <div
                key={app.id}
                className={`group flex items-center justify-between py-5 ${
                  idx !== applications.length - 1
                    ? "border-b border-zinc-100"
                    : ""
                } hover:bg-zinc-50/80 transition-colors -mx-4 px-4 sm:mx-0 sm:px-4 sm:rounded-xl`}
              >
                {/* Last Update Date */}
                <div className="w-1/4 flex items-center">
                  <span className="text-sm font-medium text-zinc-900">
                    {app.lastUpdateDate}
                  </span>
                </div>

                {/* Source Name */}
                <div className="w-1/4 flex items-center pr-4">
                  <span className="text-sm text-zinc-700 truncate">
                    {app.sourceName}
                  </span>
                </div>

                {/* Source */}
                <div className="w-1/4 flex items-center">
                  <span className="text-sm font-medium text-zinc-700 bg-zinc-100 w-fit px-3 py-1 rounded-md">
                    {app.source}
                  </span>
                </div>

                {/* Status Dropdown */}
                <div className="w-1/4 flex items-center pr-4">
                  <Select
                    value={app.status}
                    onValueChange={(val) =>
                      handleStatusChange(app.id, val as string)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs font-semibold w-full max-w-[180px] bg-white border-zinc-200 focus:ring-zinc-900">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="text-xs"
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 w-24 text-zinc-400">
                  <button
                    className="hover:text-blue-600 transition-colors"
                    title="View Log"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                  <button
                    className="hover:text-zinc-900 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    className="hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
