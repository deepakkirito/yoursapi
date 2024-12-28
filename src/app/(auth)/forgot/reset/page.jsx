import Auth from "@/components/auth";
import { CircularProgress } from "@mui/material";
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<CircularProgress />}>
        <Auth auth="reset" />
      </Suspense>
    </div>
  );
}
