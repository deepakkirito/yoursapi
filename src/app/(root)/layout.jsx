"use client";
import { Box, Grid2, useMediaQuery } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";
import Navbar from "@/components/common/navbar";
import Sidebar from "@/components/common/sidebar";
import { CreateSidebarContext } from "@/utilities/context/sidebar";

export default function Layout({ children }) {
  const { open, setOpen } = useContext(CreateSidebarContext);

  return (
    <div>
      <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              width: "100vw",
            }}
          >
            <CircularProgress color="secondary" size={24} />
          </Box>
        }
      >
        <Box>
          <Navbar />
          <Box
            width={"100%"}
            sx={{
              display: "flex",
              padding: "0rem 0.5rem 1rem",
              gap: "1rem",
              height: "fit-content",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                transition: "all 500ms",
                width: {
                  xs: open ? "60vw" : "0vw",
                  sm: open ? "40vw" : "0vw",
                  md: open ? "20%" : "3.5rem",
                  lg: open ? "15%" : "3.7rem",
                  xl: open ? "13%" : "3.7rem",
                },
                position: {
                  xs: "fixed",
                  md: "relative",
                },
                overflow: "hidden",
                zIndex: "10",
                height: "fit-content",
              }}
            >
              <Sidebar
                getOpen={(val) => {
                  setOpen(val);
                }}
              />
            </Box>
            <Box
              sx={{
                transition: "all 500ms",
                width: {
                  xs: "100vw",
                  md: open ? "80%" : "calc(100% - 3.5rem)",
                  lg: open ? "85%" : "calc(100% - 3.7rem)",
                  xl: open ? "87%" : "calc(100% - 3.7rem)",
                },
                height: "fit-content",
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Suspense>
    </div>
  );
}
