"use client";
import { Box, Grid2 } from "@mui/material";
import DataContent from "./content";
import Navbar from "./navbar";
import ContentBar from "@/components/common/contentBar";
import { useState } from "react";

const DataApi = () => {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <Box
        sx={{
          borderRadius: "1rem",
          border: "1rem solid",
          borderColor: "background.default",
          boxShadow: "0 0 1rem background.default",
          outline: "2px solid",
          outlineColor: "background.inactive",
          height: "100%",
        }}
      >
        <Box
          sx={{
            backgroundColor: "background.foreground",
            borderBottom: "1rem solid",
            borderColor: "background.default",
            padding: "1rem",
            position: {
              lg: "sticky",
              xs: "relative",
            },
            top: "0",
            zIndex: "5",
            width: "100%",
          }}
        >
          <Navbar />
        </Box>
        <Grid2
          container
          spacing={2}
          sx={{
            padding: "1rem",
            overflow: "auto",
            height: {
              lg: "calc(100vh - 15.7rem)",
              xs: "100%",
            },
          }}
        >
          <Grid2 item size={{ xs: 12, md: open ? 6 : 11.2 }} sx={{ transition: "all 0.5s" }}>
            <DataContent />
          </Grid2>
          <Grid2 item size={{ xs: 12, md:  open ? 6 : 0.8 }} sx={{ transition: "all 0.5s" }}>
            <ContentBar
              setOpen={setOpen}
              open={open}
              items={[
                {
                  id: "custom",
                  title: "Custom Data",
                  content:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                },
                {
                  id: "ai",
                  title: "YoursApi AI",
                  content:
                    "Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
                },
                {
                  id: "schema",
                  title: "Schema",
                  content:
                    "Nulla facilisi. Proin interdum metus a sollicitudin sagittis.",
                },
                {
                  id: "settings",
                  title: "Settings",
                  content:
                    "Nulla facilisi. Proin interdum metus a sollicitudin sagittis.",
                },
              ]}
              defaultExpanded={"custom"}
            />
          </Grid2>
        </Grid2>
      </Box>
    </div>
  );
};

export default DataApi;
