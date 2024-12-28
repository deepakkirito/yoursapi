"use client";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";
import Statistics from "@/components/pages/project/statistics";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<CircularProgress />}>
        <Statistics />
      </Suspense>
    </div>
  );
}
