"use client";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";
import Statistics from "@/components/pages/project/statistics";
import Dashboard from "@/components/common/dashboard";

export default function Page() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-[calc(100vh-15rem)]">
            <CircularProgress />
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    </div>
  );
}
