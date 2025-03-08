"use client";
import { Box } from "@mui/material";

export default function Layout({ children }) {
  return (
    <Box
      className="mx-2"
      sx={{
        borderRadius: "1rem",
        border: "0.2rem solid",
        borderColor: "background.default",
        backgroundColor: "background.foreground",
        height: "calc(100vh - 7rem)",
        // overflow: "auto",
        paddingBottom: "1rem",
      }}
    >
      {children}
    </Box>
  );
}
