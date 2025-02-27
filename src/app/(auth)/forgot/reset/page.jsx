"use client";
import { CircularProgress } from "@mui/material";
import { Suspense } from "react";
import dynamic from "next/dynamic";
const Auth = dynamic(() => import("@/components/auth"), { ssr: false });

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center flex-col gap-8">
          <CircularProgress color="secondary" size={24} />
        </div>
      }
    >
      <Auth auth="reset" />
    </Suspense>
  );
};

export default Page;
