"use client";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import { Box, Button, Typography } from "@mui/material";
import { useState, useEffect } from "react";

const CookieConsent = () => {
  const [consent, setConsent] = useLocalStorage("cookieConsent", false);


  useEffect(() => {
    if (consent) {
      document.cookie = "userConsent=true; path=/; Secure; SameSite=None";
    }
  }, [consent]);

  const acceptCookies = () => {
    setConsent(true);
  };

  return (
    !consent && (
      <Box
        className="flex flex-col items-center justify-center gap-4 p-6"
        sx={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          backgroundColor: "background.defaultSolid",
          textAlign: "center",
          zIndex: 100000,
          borderTop: "1px solid",
          borderColor: "background.foreground",
        }}
      >
        <Typography variant="h7">
          This site uses cookies to improve your experience.
        </Typography>
        <Button variant="outlined" onClick={acceptCookies}>
          Accept
        </Button>
      </Box>
    )
  );
};

export default CookieConsent;
