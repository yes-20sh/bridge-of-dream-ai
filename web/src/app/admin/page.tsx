import React, { Suspense } from "react";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, Activity, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RequestTab, RequestTabSkeleton } from "@/components/RequestTab/RequestTab";
import { RequestApiContainer } from "@/api/RequestApiContainer/RequestApiContainer";
import { Button } from "@/components/ui/button";

// Mock data for the table based on user request
const dashboardData = [
  {
    id: "1",
    user: "John Doe",
    email: "john@example.com",
    action: "Applied for Job",
    detail: "Senior Frontend Engineer at Google",
    date: "2026-07-04",
    status: "Completed"
  },
  {
    id: "2",
    user: "Sarah Smith",
    email: "sarah@example.com",
    action: "Save Resume",
    detail: "Saved 'Product_Manager_Resume_v2.pdf'",
    date: "2026-07-04",
    status: "Completed"
  },
  {
    id: "3",
    user: "Michael Chen",
    email: "michael@example.com",
    action: "Create Resume",
    detail: "Created from Base Template",
    date: "2026-07-03",
    status: "Completed"
  },
  {
    id: "4",
    user: "Emma Wilson",
    email: "emma@example.com",
    action: "ATS Optimize",
    detail: "Optimized for 'UX Designer' role",
    date: "2026-07-03",
    status: "Processing"
  },
  {
    id: "5",
    user: "David Miller",
    email: "david@example.com",
    action: "Request for Demo",
    detail: "Enterprise Team Plan Demo",
    date: "2026-07-02",
    status: "Pending"
  },
  {
    id: "6",
    user: "Jessica Lee",
    email: "jessica@example.com",
    action: "Applied for Job",
    detail: "Backend Developer at Stripe",
    date: "2026-07-02",
    status: "Completed"
  }
];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const activeView = params?.tab === "requests" ? "requests" : "dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      
      {/* Page Header with Centered Navigation */}
      <div className="bg-white border-b border-zinc-200 sticky top-[72px] z-40">
        <div className="container mx-auto px-6 lg:px-12 flex h-16 items-center justify-between">
          <div className="w-[120px]"></div>

          <div className="flex items-center gap-6 sm:gap-10 font-medium text-sm sm:text-base">
            <Link
              href="?tab=dashboard"
              className={`relative h-16 flex items-center transition-colors hover:text-zinc-900 ${
                activeView === "dashboard" ? "text-zinc-900" : "text-zinc-500"
              }`}
            >
              Dashboard
              {activeView === "dashboard" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-md" />
              )}
            </Link>
            <Link
              href="?tab=requests"
              className={`relative h-16 flex items-center transition-colors hover:text-zinc-900 ${
                activeView === "requests" ? "text-zinc-900" : "text-zinc-500"
              }`}
            >
              Requests
              {activeView === "requests" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-md" />
              )}
            </Link>
          </div>

          <div className="w-[120px] hidden sm:block"></div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-10 space-y-8">
        
        {activeView === "dashboard" && (
          <>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Admin Dashboard</h1>
              <p className="text-zinc-500">Overview of recent user activities, optimizations, and requests.</p>
            </div>

        {/* Dashboard Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">2,350</div>
              <p className="text-xs text-zinc-500 mt-1">+180 from last month</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Resumes Created</CardTitle>
              <FileText className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">1,204</div>
              <p className="text-xs text-zinc-500 mt-1">+5% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">ATS Optimizations</CardTitle>
              <Sparkles className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">8,549</div>
              <p className="text-xs text-zinc-500 mt-1">+24% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Demo Requests</CardTitle>
              <Activity className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">42</div>
              <p className="text-xs text-zinc-500 mt-1">12 pending review</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Table */}
        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
            <CardDescription>
              A detailed log of recent actions including applications, resume creation, and demo requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50">
                  <TableRow>
                    <TableHead className="font-semibold text-zinc-900">User</TableHead>
                    <TableHead className="font-semibold text-zinc-900">Action</TableHead>
                    <TableHead className="font-semibold text-zinc-900 hidden md:table-cell">Details</TableHead>
                    <TableHead className="font-semibold text-zinc-900">Date</TableHead>
                    <TableHead className="font-semibold text-zinc-900 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-zinc-50/50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900">{row.user}</span>
                          <span className="text-xs text-zinc-500">{row.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800">
                          {row.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-600 hidden md:table-cell max-w-[300px] truncate">
                        {row.detail}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                        {row.date}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.status === "Completed" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                        )}
                        {row.status === "Pending" && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                        )}
                        {row.status === "Processing" && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* End of Dashboard View */}
          </>
        )}

        {activeView === "requests" && (
          <Suspense fallback={<RequestTabSkeleton />}>
            <RequestApiContainer searchParams={searchParams} />
          </Suspense>
        )}

      </div>
    </div>
  );
}
