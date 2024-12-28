import Auth from "@/components/auth";
import { CircularProgress } from "@mui/material";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center flex-col gap-8">
          <CircularProgress color="secondary" size={24} />
        </div>
      }
    >
      {/* <Auth auth="forgot" /> */}
    </Suspense>
  );
};

export default Page;