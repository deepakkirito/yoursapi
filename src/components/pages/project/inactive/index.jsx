"use client";
import { Box } from "@mui/material";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";
import ProjectLayout from "@/components/pages/project/projectLayout";
import {
  deleteProjectApi,
  getInactiveProjectApi,
} from "@/utilities/api/projectApi";
import { DeleteForever } from "@mui/icons-material";

export default function InactiveProject() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <Box
        sx={{
          height: "inherit",
          overflow: "hidden",
        }}
      >
        <ProjectLayout
          title={"Inactive Projects"}
          getApi={getInactiveProjectApi}
          deleteData={{
            api: deleteProjectApi,
            icon: <DeleteForever color="secondary" />,
            tooltip: "Delete permanently",
          }}
          alertContent={
            "All your Api's and data within them will be deleted forever."
          }
        />
      </Box>
    </Suspense>
  );
}
