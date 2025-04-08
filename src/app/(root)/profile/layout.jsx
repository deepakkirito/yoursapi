"use client";
import { Box } from "@mui/material";

export default function Layout({ children }) {
  return (
    <Box
      sx={{
        border: "0.1rem solid",
        borderColor: "divider",
        height: "inherit",
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
}
