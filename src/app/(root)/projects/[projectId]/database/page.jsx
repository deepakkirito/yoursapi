"use client";
import ProjectDatabase from "@/components/pages/project/database";
import { Box } from "@mui/material";

const Page = (props) => {
  return (
    <Box
      className="px-2"
      sx={{
        height: {
          xs: "90vh",
          lg: "100%",
        },
        overflow: "auto",
      }}
    >
      <ProjectDatabase />
    </Box>
  );
};

export default Page;
