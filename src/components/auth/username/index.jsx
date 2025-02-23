"use client";
import CustomInput from "@/components/common/customTextField";
import {
  Button,
  CircularProgress,
  FormHelperText,
  InputAdornment,
  Typography,
} from "@mui/material";
import Person4RoundedIcon from "@mui/icons-material/Person4Rounded";
import SwapCallsOutlinedIcon from "@mui/icons-material/SwapCallsOutlined";
import { useEffect, useState } from "react";
import { CheckUsernameApi } from "@/utilities/api/authApi";
import { InfoOutlined } from "@mui/icons-material";
import { updateUsernameApi } from "@/utilities/api/userApi";
import { catchError } from "@/utilities/helpers/functions";
import { useRouter } from "next/navigation";

const Username = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [usernameExists, setUsernameExists] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkUsername();
  }, [username]);

  const checkUsername = async () => {
    await CheckUsernameApi(username)
      .then((res) => {
        if (res.status === 200) {
          setUsernameExists(false);
        }
      })
      .catch((err) => {
        if (err.status === 400) {
          setUsernameExists(true);
        }
      });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await updateUsernameApi({
      username: username,
      referralCode: referralCode,
    })
      .then((res) => {
        localStorage.setItem("login", true);
        router.push("/projects");
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        onChange={(event) => {
          const formElements = event.currentTarget.elements;
          setUsername(formElements.username.value);
          setReferralCode(formElements.referralCode.value);
        }}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            formError={usernameExists !== null && usernameExists}
            required
            formLabel="Username"
            type="text"
            name="username"
            color={usernameExists !== null && usernameExists ? "error" : ""}
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
          </CustomInput>
          <CustomInput
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
        </div>
        <Button
          type="submit"
          variant="contained"
          color="loading"
          fullWidth
          endIcon={loading && <CircularProgress size={16} color="secondary" />}
          disabled={loading || usernameExists || username.length < 3}
        >
          Create
        </Button>
      </form>
    </div>
  );
};

export default Username;
