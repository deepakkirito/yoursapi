"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import { ThemeContext } from "@/utilities/context/theme";
import {
  Avatar,
  Box,
  CircularProgress,
  CssBaseline,
  GlobalStyles,
  IconButton,
  Typography,
} from "@mui/material";
import { getUsersApi } from "@/utilities/api/userApi";
import Image from "next/image";
import style from "./style.module.scss";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "@/utilities/context/auth";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { mainListUrl } from "@/components/assets/constants/barList";
import Logo from "@/app/favicon.svg";
import { CreateNavTitleContext } from "@/utilities/context/navTitle";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import { catchError } from "@/utilities/helpers/functions";
import useCustomWindow from "@/utilities/helpers/hooks/window";
import Profile from "./profile";
import Notification from "./notification";
import { CreateSidebarContext } from "@/utilities/context/sidebar";

function ColorSchemeToggle(props) {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <IconButton
      aria-label="toggle light/dark mode"
      size="sm"
      variant="outlined"
      sx={{
        cursor: "pointer",
      }}
      onClick={(event) => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    >
      {theme === "light" ? (
        <DarkModeRoundedIcon color="secondary" />
      ) : (
        <LightModeRoundedIcon color="secondary" />
      )}
    </IconButton>
  );
}

const Navbar = () => {
  const [userData, setUserData] = useState({});
  const [user, setUser] = useLocalStorage("user");
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = usePathname();
  const { setLogin } = useContext(AuthContext);
  const { sidebarOpen, setSidebarOpen } = useContext(CreateSidebarContext);
  const router = useRouter();
  const { navTitle, setNavTitle } = useContext(CreateNavTitleContext);
  // const [profile, setProfile] = useLocalStorage("profile");
  const window = useCustomWindow();

  useEffect(() => {
    if (localStorage.getItem("login") !== "true") {
      window.location.pathname = "/login";
    }
  }, [location]);

  const isProjectLink = useMemo(() => {
    return mainListUrl.includes(location);
  }, [location]);

  useEffect(() => {
    isProjectLink && window.localStorage.removeItem("project");
    isProjectLink && setNavTitle("");
    isProjectLink && history.replaceState(null, "", window.location.href);
  }, [isProjectLink]);

  const handleClick = (event) => {
    !anchorEl ? setAnchorEl(event.currentTarget) : setAnchorEl(null);
  };

  useEffect(() => {
    getUser(true);
    const intervalId = setInterval(() => {
      getUser(false);
    }, 1000 * 60);

    return () => clearInterval(intervalId);
  }, []);

  const getUser = (loading) => {
    setLoading(loading);
    getUsersApi()
      .then((res) => {
        setUserData(res.data.data);
        setUser(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        catchError(err);
        setLoading(false);
      });
  };

  return (
    <Box
      id="navbar"
      sx={(theme) => ({
        width: "100vw",
        position: "relative",
        zIndex: "100",
      })}
    >
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            "--Form-maxWidth": "800px",
            "--Transition-duration": "0.4s",
          },
        }}
      />
      <Box
        sx={{
          width: "100vw",
          transition: "width var(--Transition-duration)",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "flex-end",
          backdropFilter: "blur(1px) !important",
          border: "0.2rem solid",
          borderBottom: "0.1rem solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "fit-content",
            width: "100%",
            px: 1,
          }}
        >
          <Box
            component="header"
            sx={{
              py: "0.9rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
              <IconButton
                color="primary"
                size="sm"
                sx={{
                  display: {
                    xs: "none",
                    md: "flex",
                  },
                }}
              >
                <Image
                  src={Logo}
                  alt="logo"
                  width={24}
                  height={24}
                  style={{
                    borderRadius: "50%",
                  }}
                  onClick={() => {
                    router.push("/projects");
                  }}
                />
              </IconButton>
              <IconButton
                color="primary"
                size="sm"
                sx={{
                  display: {
                    xs: !sidebarOpen ? "flex" : "none",
                    md: "none",
                  },
                }}
                onClick={() => {
                  setSidebarOpen(!sidebarOpen);
                }}
              >
                <MenuRoundedIcon color="secondary" />
              </IconButton>
              <Typography
                variant="h6"
                className="cursor-pointer"
                onClick={() => router.push("/projects")}
              >
                Youpi
              </Typography>
            </Box>
            {navTitle && (
              <Box>
                <Typography variant="h6">{navTitle}</Typography>
              </Box>
            )}
            <Box className="flex gap-2 items-center">
              <ColorSchemeToggle />
              <Notification />
              {loading ? (
                <div className="pl-4">
                  <CircularProgress size={24} />
                </div>
              ) : (
                <Profile
                  userData={userData}
                  setLogin={setLogin}
                  router={router}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
