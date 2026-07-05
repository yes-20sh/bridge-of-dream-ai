import React, { Suspense } from "react";
import { JobDetailClient } from "./JobDetailClient";
import { JobDetailApiContainer } from "@/api/JobDetailApiContainer/JobDetailApiContainer";
import { JobDescriptionShimmer } from "@/components/JobDescription/JobDescription";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const descriptionContent = (
    <Suspense fallback={<JobDescriptionShimmer />}>
      <JobDetailApiContainer jobId={id} />
    </Suspense>
  );

  return <JobDetailClient descriptionContent={descriptionContent} />;
}
