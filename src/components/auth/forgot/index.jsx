import { useState } from "react";
import style from "./style.module.scss";
import { ForgotApi } from "@/utilities/api/authApi";
import Lottie from "react-lottie";
import EmailSent from "@/components/assets/json/emailSent.json";
import { showNotification } from "@/components/common/notification";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Mail } from "@mui/icons-material";
import CustomInput from "@/components/common/customTextField";

const Forgot = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const sendMail = () => {
    ForgotApi(email)
      .then((res) => {
        setEmailSent(true);
        setLoading(false);
        showNotification({
          content: res.data.message,
          type: "success",
        });
      })
      .catch((err) => {
        setLoading(false);
        showNotification({
          content: err.response.data.message,
          type: "error",
        });
      });
  };

  return (
    <Box>
      {!emailSent && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setLoading(true);
            sendMail();
          }}
          onChange={(event) => {
            const formElements = event.currentTarget.elements;
            setEmail(formElements.email.value);
          }}
        >
          <CustomInput
            required
            formClassName={style.email}
            type="text"
            name="email"
            formLabel="Email"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail color="secondary" />
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
              disabled={!email}
              endIcon={loading && <CircularProgress size={16} />}
            >
              Send verification mail
            </Button>
          </Stack>
        </form>
      )}
      {emailSent && (
        <Box className="text-center">
          <Lottie
            options={{
              animationData: EmailSent,
              loop: true,
              autoPlay: true,
            }}
            height={300}
            width={300}
          />
          <Typography color="text.primary">
            Password reset link sent successfully
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Forgot;
