import CustomToggle from "@/components/common/customToggle";
import { showNotification } from "@/components/common/notification";
import { updateApiStatusApi } from "@/utilities/api/apiApi";
import { catchError } from "@/utilities/helpers/functions";
import {
  Box,
  CircularProgress,
  Divider,
  Grid2,
  Typography,
} from "@mui/material";
import { useState } from "react";

const Settings = ({
  apiData,
  id,
  refetch = (loading) => {},
  setApiData = () => {},
  shared = false,
  permission,
}) => {
  const [loading, setLoading] = useState({});
  const getPermission = shared ? permission !== "read" : true;

  const toggleOptions = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  const handleUpdateApiData = async (key, value) => {
    setLoading({ [key]: true });
    const body = {
      key: key,
      value: value,
    };
    await updateApiStatusApi(id, body)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        setApiData({ ...apiData, [key]: { ...apiData[key], active: value } });
      })
      .catch((err) => {
        refetch(false);
        catchError(err);
      })
      .finally(() => {
        setLoading({ [key]: false });
      });
  };

  return (
    <Grid2 container spacing={2}>
      {Object.keys(apiData).map((key, index) => {
        if (
          [
            "getRequest",
            "postRequest",
            "putRequest",
            "deleteRequest",
            "headRequest",
          ].includes(key)
        ) {
          return (
            <Grid2
              item
              key={index}
              size={{ xs: 12, md: 6, lg: 12, xl: 6 }}
              className="flex flex-col gap-2"
              sx={{
                outline: "0.1px solid",
                outlineColor: "divider",
                borderRadius: "0.3rem",
                padding: "1rem",
                backgroundColor: "background.default",
              }}
            >
              <div>
                <div className="flex gap-2 items-center mb-1">
                  <Typography
                    variant="h7"
                    sx={{
                      minWidth: "7rem",
                      maxWidth: "10rem",
                    }}
                  >
                    {key.toLocaleUpperCase()}{" "}
                  </Typography>
                  {loading[key] && (
                    <CircularProgress color="secondary" size={16} />
                  )}
                </div>
                <Divider />
              </div>
              <Box className="flex gap-6 items-center">
                <Typography variant="h7">Used</Typography>
                <Typography variant="h7">{apiData[key].used} times</Typography>
              </Box>
              <Box className="flex gap-2 items-center">
                <Typography variant="h7">Status</Typography>
                {!loading[key] && (
                  <CustomToggle
                    options={toggleOptions}
                    value={apiData[key].active}
                    disabled={!getPermission}
                    handleChange={(value) => {
                      if (apiData[key].active !== value && value !== null) {
                        handleUpdateApiData(key, value);
                      } else {
                        setLoading({ [key]: true });
                        setTimeout(() => {
                          setLoading({ [key]: false });
                        }, 10);
                      }
                    }}
                  />
                )}
              </Box>
            </Grid2>
          );
        }
      })}
    </Grid2>
  );
};

export default Settings;
