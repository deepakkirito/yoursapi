import style from "./style.module.scss";
import {
  CheckEmailApi,
  CheckUsernameApi,
  RegisterApi,
} from "@/utilities/api/authApi";
import {
  InfoOutlined,
  Key,
  Mail,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import SwapCallsOutlinedIcon from "@mui/icons-material/SwapCallsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { useRouter } from "next/navigation";
import { showNotification } from "@/components/common/notification";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Person4RoundedIcon from "@mui/icons-material/Person4Rounded";
import CustomInput from "@/components/common/customTextField";

const Signup = () => {
  const [emailExists, setEmailExists] = useState(null);
  const [usernameExists, setUsernameExists] = useState(null);
  const [passwordMissmatch, setPasswordMissmatch] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [errors, setErrors] = useState({
    firstname: "",
    lastname: "",
    password: "",
    username: "",
    email: "",
    referralCode: "",
  });
  const [seePassword, setSeepassword] = useState(false);
  const minLength = 8;
  const router = useRouter();
  const [input, setInput] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    verifyPassword: "",
    referralCode: "",
  });
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setPasswordMissmatch(false);
  }, [password, verifyPassword]);

  const register = () => {
    RegisterApi(input)
      .then((res) => {
        setLoading(false);
        setErrors({
          firstname: "",
          lastname: "",
          password: "",
        });
        router.push("/login");
        showNotification({
          content: res.data.message,
        });
        showNotification({
          content: "Please verify your email to login",
          type: "info",
        });
      })
      .catch((err) => {
        setLoading(false);
        let temp = {
          firstname: "",
          lastname: "",
          password: "",
          username: "",
          email: "",
        };
        err.response.data.errors?.length
          ? err.response.data.errors.forEach((item) => {
              temp[item.path] = item.msg;
              showNotification({
                content: item.msg,
                type: "error",
              });
            })
          : showNotification({
              content: err.response.data.message,
              type: "error",
            });
        setErrors(temp);
      });
  };
  return (
    <Box>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setFocused(true);
          if (input.password !== input.verifyPassword) {
            setPasswordMissmatch(true);
          } else {
            setLoading(true);
            register();
          }
        }}
        onChange={(event) => {
          setFocused(false);
          const formElements = event.currentTarget.elements;
          const data = {
            firstname: formElements.firstname.value,
            lastname: formElements.lastname.value,
            username: formElements.username.value,
            email: formElements.email.value,
            password: formElements.password.value,
            verifyPassword: formElements.verifyPassword.value,
            referralCode: formElements.referralCode.value,
          };
          setErrors({
            firstname: "",
            lastname: "",
            password: "",
            username: "",
            email: "",
            referralCode: "",
          });
          setInput(data);
          data.email.length > 10
            ? CheckEmailApi(data.email)
                .then((res) => res.status === 200 && setEmailExists(false))
                .catch((err) => err.status === 400 && setEmailExists(true))
            : setEmailExists(null);
          data.username.length > 2
            ? CheckUsernameApi(data.username)
                .then((res) => res.status === 200 && setUsernameExists(false))
                .catch((err) => err.status === 400 && setUsernameExists(true))
            : setUsernameExists(null);
        }}
      >
        <Box className="flex items-start gap-4">
          <CustomInput
            focused={focused}
            formError={errors.firstname}
            required
            formLabel="First name"
            formClassName={style.user}
            type="text"
            name="firstname"
            autoFocus
            color={errors.firstname ? "error" : ""}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlinedIcon color="secondary" />
                  </InputAdornment>
                ),
              },
            }}
          >
            {errors.firstname && (
              <FormHelperText className="flex items-start gap-2">
                <InfoOutlined />
                <Typography>{errors.firstname}</Typography>
              </FormHelperText>
            )}
          </CustomInput>
          <CustomInput
            focused={focused}
            formError={errors.lastname}
            required
            formLabel="Last name"
            formClassName={style.user}
            type="text"
            name="lastname"
            color={errors.lastname ? "error" : ""}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlinedIcon color="secondary" />
                  </InputAdornment>
                ),
              },
            }}
          >
            {errors.lastname && (
              <FormHelperText className="flex items-start gap-2">
                <InfoOutlined />
                <Typography>{errors.lastname}</Typography>
              </FormHelperText>
            )}
          </CustomInput>
        </Box>
        <CustomInput
          focused={focused}
          formError={
            (usernameExists !== null && usernameExists) || errors.username
          }
          required
          formClassName={style.username}
          formLabel="Username"
          type="text"
          name="username"
          color={
            (usernameExists !== null && usernameExists) || errors.username
              ? "error"
              : ""
          }
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Person4RoundedIcon color="secondary" />
                </InputAdornment>
              ),
            },
          }}
        >
          {usernameExists !== null && usernameExists && (
            <FormHelperText className="flex items-start gap-2">
              <InfoOutlined />
              <Typography>Username already exists</Typography>
            </FormHelperText>
          )}
          {errors.username && (
            <FormHelperText className="flex items-start gap-2">
              <InfoOutlined />
              <Typography>{errors.username}</Typography>
            </FormHelperText>
          )}
        </CustomInput>
        <CustomInput
          focused={focused}
          formError={(emailExists !== null && emailExists) || errors.email}
          required
          formClassName={style.email}
          formLabel="Email"
          type="email"
          name="email"
          color={
            (emailExists !== null && emailExists) || errors.email ? "error" : ""
          }
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
          {emailExists !== null && emailExists && (
            <FormHelperText className="flex items-start gap-2">
              <InfoOutlined />
              <Typography>Email already exists</Typography>
            </FormHelperText>
          )}
          {errors.email && (
            <FormHelperText className="flex items-start gap-2">
              <InfoOutlined />
              <Typography>{errors.email}</Typography>
            </FormHelperText>
          )}
        </CustomInput>
        <Stack
          spacing={0.5}
          sx={{ "--hue": Math.min(password.length * 10, 120) }}
        >
          <CustomInput
            focused={focused}
            formError={passwordMissmatch || errors.password}
            required
            formClassName={style.password}
            formLabel="Password"
            type={seePassword ? "text" : "password"}
            name="password"
            color={passwordMissmatch || errors.password ? "error" : ""}
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
                      {seePassword ? <VisibilityOff color="secondary" /> : <Visibility color="secondary" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          >
            {errors.password && (
              <FormHelperText className="flex items-start gap-2">
                <InfoOutlined />
                <Typography>{errors.password}</Typography>
              </FormHelperText>
            )}
          </CustomInput>
          {password.length > 2 && (
            <>
              <LinearProgress
                variant="determinate"
                size="md"
                value={Math.min((password.length * 100) / minLength, 100)}
                sx={{
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "hsl(var(--hue) 80% 30%)",
                  },
                }}
              />
              <Typography
                sx={{ alignSelf: "flex-end", color: "hsl(var(--hue) 80% 30%)" }}
              >
                {password.length < 8 && "Very weak"}
                {password.length >= 8 && password.length < 10 && "Weak"}
                {password.length >= 10 && password.length < 14 && "Strong"}
                {password.length >= 14 && "Very strong"}
              </Typography>
            </>
          )}
        </Stack>
        <CustomInput
          focused={focused}
          formError={passwordMissmatch}
          required
          formClassName={style.verifyPassword}
          formLabel="Verify Password"
          type="password"
          name="verifyPassword"
          color={passwordMissmatch ? "error" : ""}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Key color="secondary" />
                </InputAdornment>
              ),
            },
          }}
          value={verifyPassword}
          onChange={(event) => setVerifyPassword(event.target.value)}
        >
          {passwordMissmatch && (
            <FormHelperText className="flex items-start gap-2">
              <InfoOutlined />
              <Typography>Password do not match</Typography>
            </FormHelperText>
          )}
        </CustomInput>
        <CustomInput
          focused={focused}
          formClassName={style.referral}
          formLabel="Referral code"
          type="text"
          name="referralCode"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SwapCallsOutlinedIcon color="secondary" />
                </InputAdornment>
              ),
            },
          }}
        ></CustomInput>
        <Stack sx={{ gap: 4, mt: 2 }} className={style.stack}>
          <Button
            type="submit"
            variant="contained"
            color="loading"
            fullWidth
            disabled={
              !input.firstname ||
              !input.lastname ||
              !input.email ||
              !input.password ||
              !input.verifyPassword ||
              errors.firstname ||
              errors.lastname ||
              errors.email ||
              errors.password ||
              errors.verifyPassword
            }
            endIcon={loading && <CircularProgress size={16} />}
          >
            Sign up
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Signup;
