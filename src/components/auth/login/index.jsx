"use client";
import { showNotification } from "@/components/common/notification";
import style from "./style.module.scss";
import { LoginApi } from "@/utilities/api/authApi";
import {
  InfoOutlined,
  Key,
  Mail,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { AuthContext } from "@/utilities/context/auth";
import CustomInput from "@/components/common/customTextField";
import useCustomWindow from "@/utilities/helpers/hooks/window";

const Login = () => {
  const [verify, setVerify] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seePassword, setSeepassword] = useState(false);
  const [input, setInput] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const { setLogin } = useContext(AuthContext);
  const [focused, setFocused] = useState(false);
  const window = useCustomWindow();

  useEffect(() => {
    if (verify) {
      // localStorage.setItem("login", "true");
      setLogin(true);
      window.location.pathname = "/projects";
    }
  }, [verify]);

  const handleLogin = async () => {
    LoginApi(input)
      .then((res) => {
        if (res.status === 200) {
          setVerify(true);
          setLoading(false);
          localStorage.setItem("login", true);
          showNotification({
            content: res.data.message,
            type: "success",
          });
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err.status === 403) {
          setVerify(false);
        }
        showNotification({
          content: err.response.data.message,
          type: "error",
        });
      });
  };

  return (
    <Box>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setFocused(true);
          const formElements = event.currentTarget.elements;
          const data = {
            email: formElements.email.value,
            password: formElements.password.value,
            rememberMe: formElements.rememberMe.checked,
          };
          handleLogin();
          setLoading(true);
        }}
        onChange={(event) => {
          setFocused(false);
          setVerify(null);
          const formElements = event.currentTarget.elements;
          const data = {
            email: formElements.email.value,
            password: formElements.password.value,
            rememberMe: formElements.rememberMe.checked,
          };
          setInput(data);
        }}
      >
        <CustomInput
          focused={focused}
          formError={verify == false}
          formClassName={style.email}
          formLabel="Email"
          type="email"
          name="email"
          required
          color={verify == false ? "error" : "primary"}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Mail color="secondary" />
                </InputAdornment>
              ),
            },
          }}
        >
          {verify == false && (
            <FormHelperText
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <InfoOutlined />
              <Typography>Invalid Email</Typography>
            </FormHelperText>
          )}
        </CustomInput>
        <CustomInput
          focused={focused}
          formError={verify == false}
          formClassName={style.password}
          formLabel="Password"
          required
          type={seePassword ? "text" : "password"}
          name="password"
          color={verify == false ? "error" : "primary"}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Key color="secondary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setSeepassword(!seePassword)}
                    edge="end"
                  >
                    {seePassword ? <Visibility color="secondary" /> : <VisibilityOff color="secondary" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        >
          {verify === false && (
            <FormHelperText
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <InfoOutlined />
              <Typography>Invalid Password</Typography>
            </FormHelperText>
          )}
        </CustomInput>
        <Stack sx={{ gap: 2, mt: 0 }} className={style.stack}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
                />
              }
              label="Remember me"
              name="rememberMe"
            />
            <Link href="/forgot">
              <Typography color="common.link">Forgot your password?</Typography>
            </Link>
          </Box>
          <Button
            type="submit"
            fullWidth
            color="loading"
            variant="contained"
            disabled={!input.email || !input.password}
            endIcon={
              loading && <CircularProgress size={16} color="loading" />
            }
          >
            Sign in
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Login;
