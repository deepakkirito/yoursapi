import CustomInput from "@/components/common/customTextField";
import CustomToggle from "@/components/common/customToggle";
import { showNotification } from "@/components/common/notification";
import { getAuthApi, updateAuthApi } from "@/utilities/api/authApiApi";
import { catchError } from "@/utilities/helpers/functions";
import { SaveRounded } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Divider,
  Grid2,
  IconButton,
  Slider,
  styled,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const toggleOptions = [
  { label: "Enabled", value: true },
  { label: "Disabled", value: false },
];

const Settings = ({ data, shared = false, permission }) => {
  const [loading, setLoading] = useState({});
  const [authData, setAuthData] = useState({});
  const [tokenAge, setTokenAge] = useState(0);
  const getPermission = shared ? permission !== "read" : true;

  useEffect(() => {
    getAuthApiData();
  }, []);

  const getAuthApiData = (id = data.projectId, loadingName = "authData") => {
    setLoading({ [loadingName]: true });
    getAuthApi(id, "data=false")
      .then((res) => {
        setLoading({ [loadingName]: false });
        setAuthData(res.data.authData);
        setTokenAge(res.data.authData.tokenAge);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading({ [loadingName]: false });
      });
  };

  const handleUpdateAuthApiData = async (key, value, newBody) => {
    const currentData = authData;
    setLoading({ [key]: true });
    const body = {
      [key]: value,
    };
    await updateAuthApi(authData._id, newBody || body)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        if (newBody) {
          setAuthData({
            ...authData,
            [key]: {
              used: authData[key].used,
              status: value,
            },
          });
        } else {
          setAuthData({
            ...authData,
            [key]: value,
          });
        }
      })
      .catch((err) => {
        setAuthData(currentData);
        catchError(err);
      })
      .finally(() => {
        setLoading({ [key]: false });
        body && getAuthApiData(authData.projectId, key);
      });
  };

  return (
    <>
      {loading?.authData ? (
        <div className="flex justify-center items-center h-[10rem]">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <div className="flex gap-4 items-start flex-col w-full">
          <div className="w-full">
            <div className="flex gap-2 items-center">
              <Typography variant="h6">Authentication Type</Typography>
              {loading?.authType && (
                <CircularProgress color="secondary" size={16} />
              )}
            </div>
            <Slider
              defaultValue={0}
              value={
                {
                  none: 0,
                  jwt: 50,
                  cookie: 100,
                }[authData.authType]
              }
              onChange={(event, value) =>
                getPermission &&
                handleUpdateAuthApiData(
                  "authType",
                  {
                    0: "none",
                    50: "jwt",
                    100: "cookie",
                  }[value]
                )
              }
              step={50}
              valueLabelDisplay="off"
              sx={{
                width: "95%",
                display: "flex",
                margin: "0rem auto 1rem",
              }}
              marks={[
                {
                  value: 0,
                  label: "None",
                },
                {
                  value: 50,
                  label: "JWT",
                },
                {
                  value: 100,
                  label: "Cookie",
                },
              ]}
            />
          </div>
          {authData?.authType !== "none" && (
            <div className="w-full flex gap-2 items-center">
              <Typography
                variant="h7"
                className="w-[7rem]"
                sx={{ fontWeight: "700" }}
              >
                Token Age
              </Typography>
              <CustomInput
                variant="standard"
                type="number"
                value={tokenAge}
                onChange={(event) => setTokenAge(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <div className="flex items-center gap-2 ml-2">
                      <Typography variant="h7">hours</Typography>
                      <div>
                        {loading["tokenAge"] ? (
                          <CircularProgress
                            color="secondary"
                            size={16}
                            className="m-2 mx-4"
                          />
                        ) : (
                          <IconButton
                            onClick={() =>
                              handleUpdateAuthApiData(
                                "tokenAge",
                                Number(tokenAge)
                              )
                            }
                            disabled={
                              loading["tokenAge"] ||
                              !tokenAge ||
                              Number(tokenAge) === authData.tokenAge ||
                              !getPermission
                            }
                          >
                            <SaveRounded />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  ),
                }}
                sx={{
                  width: "100%",
                  margin: "0rem auto 1rem",
                }}
              />
            </div>
          )}
          <Divider className="w-full" />
          <div className="w-full flex gap-2 items-start flex-col">
            <Typography variant="h6">Google Captcha</Typography>
            {loading["captcha"] ? (
              <CircularProgress color="secondary" size={16} />
            ) : (
              <CustomToggle
                options={toggleOptions}
                value={authData.captcha}
                disabled={!getPermission}
                handleChange={(value) => {
                  if (value !== null) {
                    handleUpdateAuthApiData("captcha", value);
                  } else {
                    setLoading({ captcha: true });
                    setTimeout(() => {
                      setLoading({ captcha: false });
                    }, 10);
                  }
                }}
              />
            )}
          </div>
          <Divider className="w-full" />
          <div className="w-full">
            <Typography variant="h6">Requests Status</Typography>
            <Grid2 container spacing={2}>
              {Object.keys(authData).map((key, index) => {
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
                        <Typography variant="h7">
                          {authData[key].used} times
                        </Typography>
                      </Box>
                      <Box className="flex gap-2 items-center">
                        <Typography variant="h7">Status</Typography>
                        {!loading[key] && (
                          <CustomToggle
                            options={toggleOptions}
                            value={authData[key].active}
                            disabled={!getPermission}
                            handleChange={(value) => {
                              if (
                                authData[key].active !== value &&
                                value !== null
                              ) {
                                handleUpdateAuthApiData(key, value, {
                                  reqType: key,
                                  reqValue: value,
                                });
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
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
