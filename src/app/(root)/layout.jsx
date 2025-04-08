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
  const { sidebarOpen, setSidebarOpen } = useContext(CreateSidebarContext);

  return (
    <div
      style={{
        height: "calc(100vh - 4.7rem)",
      }}
    >
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
        <Box height={"inherit"}>
          <Navbar />
          <Box
            sx={{
              display: "flex",
              padding: "0rem",
              height: "inherit",
              overflow: "auto",
            }}
          >
            <Box
              sx={{
                transition: "all 500ms",
                width: {
                  xs: sidebarOpen ? "60vw" : "0vw",
                  sm: sidebarOpen ? "40vw" : "0vw",
                  md: sidebarOpen ? "20%" : "3.7rem",
                  lg: sidebarOpen ? "15%" : "3.7rem",
                  xl: sidebarOpen ? "11%" : "3.7rem",
                },
                position: {
                  xs: "fixed",
                  md: "relative",
                },
                overflow: "hidden",
                zIndex: "1000",
                height: "auto",
                marginLeft: {
                  xs: "0rem",
                  // md: "1rem",
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
                  xl: sidebarOpen ? "89%" : "calc(100% - 3.7rem)",
                },
                height: "inherit",
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
