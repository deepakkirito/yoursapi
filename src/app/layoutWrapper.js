"use client";
import { toast, ToastContainer } from "react-toastify";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Context from "@/utilities/context";
import customTheme from "@/utilities/theme";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
import FullScreenPopup from "@/components/common/popup/fullScreen";
import DarkBackground from "@/components/assets/other/darkBackground.jpg";
import LightBackground from "@/components/assets/other/lightBackground.avif";
import Alert from "@/components/common/popup/alert";

const CustomIcon = (props) => {
  if (props.isLoading) return <CircularProgress />;

  switch (props.type) {
    case "info":
      return <HelpOutlineOutlinedIcon color="#fo7857" />;
    case "success":
      return <ThumbUpAltOutlinedIcon color={"#4fbo6d"} />;
    case "error":
      return <ErrorOutlineOutlinedIcon color={"bf2c34"} />;
    case "warning":
      return <WarningAmberOutlinedIcon color={"#d49137"} />;
    default:
      return undefined;
  }
};

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [mode, setMode] = useState("");
  const theme = createTheme(customTheme(mode));

  useEffect(() => {
    setMode(localStorage.getItem("theme"));
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        toast.play({ id: "toaster" });
      } else {
        toast.pause({ id: "toaster" });
      }
    });
  }, []);

  useEffect(() => {
    // document.body.style.backgroundColor = mode === "dark" ? "#677ca5" : "white";
    document.body.style.backgroundImage =
      mode === "dark"
        ? `url(${DarkBackground.src})`
        : `url(${LightBackground.src})`;
    document.body.style.scrollbarColor = `${theme.palette.loading.main} transparent`;
  }, [mode, theme.palette.background]);

  return (
    <Context getTheme={(value) => setMode(value)}>
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID}
      >
        <ThemeProvider theme={theme}>
          <ToastContainer
            closeOnClick
            draggable
            id="toaster"
            icon={CustomIcon}
          />
          <FullScreenPopup />
          <Alert />
          {children}
        </ThemeProvider>
      </GoogleOAuthProvider>
    </Context>
  );
}
