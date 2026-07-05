import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AccountSettingsSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50/50 py-10">
      <div className="container mx-auto px-6 lg:px-12 space-y-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-[250px]" />
          <Skeleton className="h-5 w-[350px]" />
        </div>

        <div className="grid gap-8 md:grid-cols-3 pb-20">
          <div className="md:col-span-1 hidden md:block">
            <div className="space-y-4 sticky top-24">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card className="shadow-sm border-zinc-200">
              <CardHeader>
                <Skeleton className="h-6 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[300px]" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200">
              <CardHeader>
                <Skeleton className="h-6 w-[180px] mb-2" />
                <Skeleton className="h-4 w-[280px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-xl" />
              </CardContent>
            </Card>

            <div className="space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="shadow-sm border-zinc-200">
                  <CardHeader>
                    <Skeleton className="h-6 w-[200px] mb-2" />
                    <Skeleton className="h-4 w-[250px]" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 w-[80px]" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-7 w-[100px] rounded-full" />
                      <Skeleton className="h-7 w-[120px] rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-6 pb-6 flex justify-end">
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
