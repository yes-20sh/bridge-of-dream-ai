"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRequestAction } from "@/api/RequestApi/useRequestAction";

interface RequestData {
  id: number;
  name: string;
  email: string;
  mobile_number: string;
  description: string;
  status: string;
}

export const RequestTab = ({
  requestsData,
  currentPage = 1,
  totalPages = 1,
}: {
  requestsData: RequestData[];
  currentPage?: number;
  totalPages?: number;
}) => {
  const { loading, handleAction } = useRequestAction();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Platform Access Requests
        </h1>
        <p className="text-zinc-500">
          Review and approve or deny access requests from users who filled out
          the request form.
        </p>
      </div>
      <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="font-semibold text-zinc-900">
                Requester
              </TableHead>
              <TableHead className="font-semibold text-zinc-900 hidden md:table-cell">
                Phone
              </TableHead>
              <TableHead className="font-semibold text-zinc-900 hidden lg:table-cell w-[40%]">
                Description
              </TableHead>
              <TableHead className="font-semibold text-zinc-900 text-center">
                Status
              </TableHead>
              <TableHead className="font-semibold text-zinc-900 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requestsData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-zinc-500"
                >
                  No requests found.
                </TableCell>
              </TableRow>
            ) : (
              requestsData.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-zinc-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">
                        {row.name}
                      </span>
                      <span className="text-xs text-zinc-500">{row.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm hidden md:table-cell whitespace-nowrap">
                    {row.mobile_number}
                  </TableCell>
                  <TableCell className="text-zinc-600 hidden lg:table-cell text-sm max-w-[400px] wrap-break-words whitespace-normal">
                    {row.description}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.status === "approve" && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Approved
                      </Badge>
                    )}
                    {row.status === "pending" && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                      >
                        Pending
                      </Badge>
                    )}
                    {row.status === "reject" && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        Rejected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {row.status !== "reject" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-xs font-semibold ${row.status === "approve" ? "opacity-50 cursor-not-allowed text-green-600 border-green-200 bg-green-50" : "hover:bg-green-50 hover:text-green-700 hover:border-green-200"}`}
                          disabled={row.status !== "pending" || loading}
                          onClick={() => handleAction({ request_id: row.id, approve: true })}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          {row.status === "approve" ? "Approved" : "Approve"}
                        </Button>
                      )}
                      {row.status !== "approve" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-xs font-semibold ${row.status === "reject" ? "opacity-50 cursor-not-allowed text-red-600 border-red-200 bg-red-50" : "hover:bg-red-50 hover:text-red-700 hover:border-red-200"}`}
                          disabled={row.status !== "pending" || loading}
                          onClick={() => handleAction({ request_id: row.id, approve: false })}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          {row.status === "reject" ? "Rejected" : "Reject"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`?tab=requests&page=${Math.max(1, currentPage - 1)}`}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`?tab=requests&page=${i + 1}`}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href={`?tab=requests&page=${Math.min(
                  totalPages,
                  currentPage + 1,
                )}`}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export const RequestTabSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Platform Access Requests
        </h1>
        <p className="text-zinc-500">
          Review and approve or deny access requests from users who filled out
          the request form.
        </p>
      </div>
      <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="font-semibold text-zinc-900">
                Requester
              </TableHead>
              <TableHead className="font-semibold text-zinc-900 hidden md:table-cell">
                Phone
              </TableHead>
              <TableHead className="font-semibold text-zinc-900 hidden lg:table-cell w-[40%]">
                Description
              </TableHead>
              <TableHead className="font-semibold text-zinc-900 text-center">
                Status
              </TableHead>
              <TableHead className="font-semibold text-zinc-900 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(2)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-32 bg-zinc-200 animate-pulse rounded"></div>
                    <div className="h-3 w-48 bg-zinc-100 animate-pulse rounded"></div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-4 w-24 bg-zinc-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-full bg-zinc-200 animate-pulse rounded"></div>
                    <div className="h-4 w-2/3 bg-zinc-100 animate-pulse rounded"></div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-6 w-20 bg-zinc-200 animate-pulse rounded-full mx-auto"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-24 bg-zinc-200 animate-pulse rounded"></div>
                    <div className="h-8 w-24 bg-zinc-200 animate-pulse rounded"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
