import { useEffect, useState } from "react";
import style from "./style.module.scss";
import { showNotification } from "@/components/common/notification";
import {
  InfoOutlined,
  Key,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { ResetApi } from "@/utilities/api/authApi";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomInput from "@/components/common/customTextField";

const Reset = ({ params }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [passwordMissmatch, setPasswordMissmatch] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("id");
  const router = useRouter();
  const [errors, setErrors] = useState({
    newPassword: "",
  });
  const maxLength = 14;
  const [seePassword, setSeepassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const changePassword = () => {
    const body = {
      newPassword: password,
    };
    ResetApi(token, body)
      .then((res) => {
        setLoading(false);
        router.push("/login");
        showNotification({
          content: res.data.message,
        });
      })
      .catch((err) => {
        setLoading(false);
        let temp = {
          newPassword: "",
        };
        err.response.data.errors?.length
          ? err.response.data.errors.forEach((item) => {
              temp[item.path] = item.msg;
            })
          : showNotification({
              content: err.response.data.message,
              type: "error",
            });
        setErrors(temp);
      });
  };

  useEffect(() => {
    setPasswordMissmatch(false);
  }, [password, verifyPassword]);

  return (
    <Box>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setFocused(true);
          if (password !== verifyPassword) {
            setPasswordMissmatch(true);
          } else {
            setLoading(true);
            changePassword();
          }
        }}
        onChange={(event) => {
          setFocused(false);
        }}
      >
        <Stack
          spacing={0.5}
          sx={{ "--hue": Math.min(password.length * 10, 120) }}
        >
          <CustomInput
            focused={focused}
            formError={passwordMissmatch || errors.newPassword}
            required
            formLabel="New password"
            formClassName={style.email}
            type={seePassword ? "text" : "password"}
            name="password"
            startDecorator={<Key color="secondary" />}
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
            {errors.newPassword && (
              <FormHelperText>
                <InfoOutlined />
                {errors.newPassword}
              </FormHelperText>
            )}
          </CustomInput>
          {password.length > 2 && (
            <>
              <LinearProgress
                variant="determinate"
                size="md"
                value={Math.min((password.length * 100) / maxLength, 100)}
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
          formLabel="Verify new password"
          formClassName={style.email}
          type="password"
          name="verifyPassword"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Key />
                </InputAdornment>
              ),
            },
          }}
          value={verifyPassword}
          onChange={(event) => setVerifyPassword(event.target.value)}
        >
          {passwordMissmatch && (
            <FormHelperText>
              <InfoOutlined />
              Password do not match
            </FormHelperText>
          )}
        </CustomInput>

        <Stack sx={{ gap: 4, mt: 2 }} className={style.stack}>
          <Button
            type="submit"
            variant="contained"
            color="loading"
            fullWidth
            disabled={!password || !verifyPassword}
            endIcon={loading && <CircularProgress size={16} />}
          >
            Submit
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Reset;
