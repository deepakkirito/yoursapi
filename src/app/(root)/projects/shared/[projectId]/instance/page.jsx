"use client";
import ProjectInstance from "@/components/pages/project/instance";
import { Box } from "@mui/material";

const Page = (props) => {
  return (
    <Box
      className="pr-2"
      sx={{
        height: {
          xs: "90vh",
          lg: "100%",
        },
        overflow: "auto",
      }}
    >
      <ProjectInstance shared={true} />
    </Box>
  );
};

export default Page;
