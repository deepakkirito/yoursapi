"use client";
import { useContext, useEffect, useState } from "react";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import { useGoogleLogin } from "@react-oauth/google";
import Login from "./login";
import Signup from "./signup";
import { Google } from "@mui/icons-material";
import Forgot from "./forgot";
import Link from "next/link";
import Reset from "./reset";
import StreamingText from "../common/streamingText";
import { GoogleApi } from "@/utilities/api/authApi";
import { useRouter } from "next/navigation";
import { showNotification } from "../common/notification";
import {
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Divider,
  GlobalStyles,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { ThemeContext } from "@/utilities/context/theme";
import { AuthContext } from "@/utilities/context/auth";
import Username from "./username";
import Image from "next/image";
import Logo from "@/app/favicon.svg";

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

const Auth = ({ auth = "login" }) => {
  const router = useRouter();
  const { palette } = useTheme();
  const { setLogin } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(false);

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("login"))) {
      router.push("/projects");
    }
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setLoading(true);
        GoogleApi(response)
          .then((res) => {
            showNotification({
              content: res.data.message,
              type: "success",
            });
            if (res.data.user) {
              localStorage.setItem("login", true);
              router.push("/projects");
            } else {
              setUsername(true);
            }
          })
          .catch((err) => {
            if ("response" in err) {
              showNotification({
                content: err.response.data.message,
                type: "error",
              });
            } else {
              showNotification({
                content: "Something went wrong",
                type: "error",
              });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (err) {
        showNotification({
          content: err.response.data.message,
          type: "error",
        });
      }
    },
    onError: (err) => {
      showNotification({
        content: err.response.data.message,
        type: "error",
      });
      setLoading(false);
    },
  });

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        overflow: "auto",
        height: "100vh",
      }}
    >
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            "--Form-maxWidth": "800px",
            "--Transition-duration": "0.4s", // set to `none` to disable transition
          },
        }}
      />
      <Box
        sx={{
          width: { xs: "100%", md: "50vw" },
          transition: "width var(--Transition-duration)",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "flex-end",
          backdropFilter: "blur(12px)",
          backgroundColor: "background.login",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
            width: "100%",
            px: 2,
          }}
        >
          <Box
            component="header"
            sx={{
              py: 3,
              display: "flex",
              justifyContent: "space-between",
              position: "sticky",
              top: 0,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                gap: 2,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              component={Link}
              href="/"
            >
              {/* <IconButton color="loading" size="sm">
                <BadgeRoundedIcon color="secondary" />
              </IconButton> */}
              <Image
                src={Logo}
                alt="logo"
                width={24}
                height={24}
                style={{
                  borderRadius: "50%",
                }}
              />
              <Typography variant="h6" color="text.primary">
                YoursApi
              </Typography>
            </Box>
            <ColorSchemeToggle />
          </Box>
          <Box
            component="main"
            sx={{
              my: "auto",
              py: 2,
              pb: 5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 400,
              maxWidth: "100%",
              mx: "auto",
              borderRadius: "sm",
              "& form": {
                display: "flex",
                flexDirection: "column",
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: "hidden",
              },
            }}
          >
            <Stack sx={{ gap: 4, mb: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography component="h1" variant="h3">
                  {auth === "login" && "Sign in"}
                  {auth === "signup" && "Sign up"}
                  {auth === "forgot" && "Forgot Password"}
                  {auth === "reset" && "Reset Password"}
                </Typography>
                {!username && (
                  <Typography color="">
                    {auth === "login" && "New to company? "}
                    {auth === "signup" && "Already in company? "}
                    {auth === "forgot" && "Recalled your password? "}
                    {auth === "reset" && "Recalled your password? "}
                    <Link href={auth === "login" ? "/signup" : "/login"}>
                      <Typography component="span" color="common.link">
                        {auth === "login" ? "Sign up" : "Sign in"}
                      </Typography>
                    </Link>
                  </Typography>
                )}
              </Stack>
              {!username ? (
                auth !== "forgot" &&
                auth !== "reset" && (
                  <Button
                    variant="contained"
                    disabled={loading}
                    fullWidth
                    startIcon={<Google />}
                    onClick={() => {
                      setLoading(true);
                      googleLogin();
                    }}
                    endIcon={
                      loading && (
                        <CircularProgress size={20} color="secondary" />
                      )
                    }
                  >
                    <StreamingText text="Continue with google" speed={100} />
                  </Button>
                )
              ) : (
                <Username />
              )}
            </Stack>
            {!username && (
              <div>
                {auth !== "forgot" && auth !== "reset" && <Divider>or</Divider>}
                <Stack sx={{ gap: 4, mt: 0 }}>
                  {auth === "login" && <Login />}
                  {auth === "signup" && <Signup />}
                  {auth === "forgot" && <Forgot />}
                  {auth === "reset" && <Reset />}
                </Stack>
              </div>
            )}
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography sx={{ textAlign: "center" }}>
              © YoursApi {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          height: "100%",
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, md: "50vw" },
          transition:
            "background-image var(--Transition-duration), left var(--Transition-duration) !important",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          backgroundColor: "background.level1",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage:
            palette.mode === "light"
              ? "url(https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&w=1000&dpr=2)"
              : "url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)",
        }}
      />
    </Box>
  );
};

export default Auth;
