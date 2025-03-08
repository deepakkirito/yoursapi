"use client";
import { Box, Grid2, useMediaQuery } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";
import Navbar from "@/components/common/navbar";
import Sidebar from "@/components/common/sidebar";
import { CreateSidebarContext } from "@/utilities/context/sidebar";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";

export default function Layout({ children }) {
  // const { sidebarOpen, setSidebarOpen } = useContext(CreateSidebarContext);
  const [sidebarOpen, setSidebarOpen] = useLocalStorage("sidebar", true);

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
              padding: "0rem",
              gap: "1rem",
              height: "fit-content",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                transition: "all 500ms",
                width: {
                  xs: sidebarOpen ? "60vw" : "0vw",
                  sm: sidebarOpen ? "40vw" : "0vw",
                  md: sidebarOpen ? "20%" : "4rem",
                  lg: sidebarOpen ? "15%" : "4rem",
                  xl: sidebarOpen ? "13%" : "4rem",
                },
                position: {
                  xs: "fixed",
                  md: "relative",
                },
                overflow: "hidden",
                zIndex: "1000",
                height: "fit-content",
                marginLeft: {
                  xs: "0rem",
                  md: "1rem",
                },
              }}
            >
              <Sidebar
                getOpen={(val) => {
                  setSidebarOpen(val);
                }}
              />
            </Box>
            <Box
              sx={{
                transition: "all 500ms",
                width: {
                  xs: "100vw",
                  md: sidebarOpen ? "80%" : "calc(100% - 3.5rem)",
                  lg: sidebarOpen ? "85%" : "calc(100% - 3.7rem)",
                  xl: sidebarOpen ? "87%" : "calc(100% - 3.7rem)",
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
