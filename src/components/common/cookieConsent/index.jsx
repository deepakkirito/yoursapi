"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Box, Button, Typography } from "@mui/material";

const CookieConsent = ({ backendUrl }) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already accepted cookies
    if (!Cookies.get("cookie_consent")) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set("cookie_consent", "true", { expires: 365 }); // Save for 1 year
    setShowBanner(false);
  };

  return showBanner ? (
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
  ) : null;
};

export default CookieConsent;
