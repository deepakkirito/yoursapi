import CustomInput from "@/components/common/customTextField";
import {
  Button,
  CircularProgress,
  InputAdornment,
  Typography,
} from "@mui/material";
import Lottie from "react-lottie";
import AuthApiBackground from "@/components/assets/json/authApiBackground.json";
import { useState } from "react";
import { catchError } from "@/utilities/helpers/functions";
import { showNotification } from "@/components/common/notification";
import { createAuthApi } from "@/utilities/api/authApiApi";
import Face2RoundedIcon from "@mui/icons-material/Face2Rounded";

const Create = ({ projectId, refetch = () => {}, shared = false, permission }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateApi = () => {
    setLoading(true);
    const body = {
      name: name,
      projectId: projectId,
    };
    createAuthApi(projectId, body)
      .then((res) => {
        setLoading(false);
        showNotification({
          content: res.data.message,
        });
        refetch(projectId);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center h-full p-4 self-center">
      <Typography variant="h4">Create your Authentication/Users api</Typography>
      <CustomInput
        label="Api Name (default: auth)"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="auth"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Face2RoundedIcon color="secondary" />
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        endIcon={loading && <CircularProgress size={16} color="loading" />}
        onClick={handleCreateApi}
        disabled={loading || shared && permission !== "admin"}
      >
        Create
      </Button>
      <Lottie
        options={{
          animationData: AuthApiBackground,
          loop: true,
          autoPlay: true,
        }}
        height={400}
        width={400}
      />
    </div>
  );
};

export default Create;
