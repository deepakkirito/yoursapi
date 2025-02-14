"use client";

import { useState, useContext, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { InfoOutlined, Key, Mail, Visibility, VisibilityOff } from "@mui/icons-material";

import { showNotification } from "@/components/common/notification";
import { LoginApi } from "@/utilities/api/authApi";
import { AuthContext } from "@/utilities/context/auth";
import useCustomWindow from "@/utilities/helpers/hooks/window";
import CustomInput from "@/components/common/customTextField";
import style from "./style.module.scss";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [seePassword, setSeePassword] = useState(false);
  const [input, setInput] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [error, setError] = useState(false);
  const { setLogin } = useContext(AuthContext);
  const windowRef = useCustomWindow();

  useEffect(() => {
    if (error) setError(false); // Reset error state only when there's an error
  }, [input.email, input.password]);

  // Handle Input Change
  const handleInputChange = useCallback((e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  // Handle Checkbox Change
  const handleCheckboxChange = useCallback((e) => {
    setInput((prev) => ({ ...prev, rememberMe: e.target.checked }));
  }, []);

  // Handle Login
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await LoginApi(input);
      if (res.status === 200) {
        localStorage.setItem("login", "true");
        setLogin(true);
        showNotification({ content: res.data.message, type: "success" });

        if (windowRef) {
          windowRef.location.pathname = "/projects";
        }
      }
    } catch (err) {
      setError(true);
      showNotification({
        content: err.response?.data?.message || "Login failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <form onSubmit={handleLogin} name="login">
        {/* Email Input */}
        <CustomInput
          formError={error}
          formClassName={style.email}
          formLabel="Email"
          type="email"
          name="email"
          autoComplete="email" // Allows browser autofill
          required
          color={error ? "error" : "primary"}
          value={input.email}
          onChange={handleInputChange}
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
          {error && (
            <FormHelperText sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <InfoOutlined />
              <Typography>Invalid Email</Typography>
            </FormHelperText>
          )}
        </CustomInput>

        {/* Password Input */}
        <CustomInput
          formError={error}
          formClassName={style.password}
          formLabel="Password"
          type={seePassword ? "text" : "password"}
          name="password"
          autoComplete="current-password" // Allows browser password autofill
          required
          color={error ? "error" : "primary"}
          value={input.password}
          onChange={handleInputChange}
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
                    onClick={() => setSeePassword(!seePassword)}
                    edge="end"
                  >
                    {seePassword ? <Visibility color="secondary" /> : <VisibilityOff color="secondary" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        >
          {error && (
            <FormHelperText sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <InfoOutlined />
              <Typography>Invalid Password</Typography>
            </FormHelperText>
          )}
        </CustomInput>

        {/* Remember Me & Forgot Password */}
        <Stack sx={{ gap: 2, mt: 0 }} className={style.stack}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={input.rememberMe}
                  onChange={handleCheckboxChange}
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

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            color="primary"
            variant="contained"
            disabled={!input.email || !input.password || loading}
            endIcon={loading && <CircularProgress size={16} color="secondary" />}
          >
            Sign in
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Login;
