import CustomInput from "@/components/common/customTextField";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid2,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import GestureRoundedIcon from "@mui/icons-material/GestureRounded";
import { useEffect, useMemo, useState } from "react";
import {
  deleteProjectDatabaseApi,
  getProjectDatabaseApi,
  saveProjectDatabaseApi,
  updateProjectDatabaseApi,
} from "@/utilities/api/projectApi";
import { usePathname } from "next/navigation";
import { decrypt, encrypt } from "@/utilities/helpers/encryption";
import { ContentCopyOutlined } from "@mui/icons-material";
import { catchError } from "@/utilities/helpers/functions";
import { showNotification } from "@/components/common/notification";

const ProjectDatabase = ({ shared = false }) => {
  const [loading, setLoading] = useState(false);
  const location = usePathname();
  const locationParts = location.split("/");
  const projectId = shared ? locationParts[3] : locationParts[2];
  const [data, setData] = useState({
    fetchData: "",
    projectString: "",
    masterString: "",
  });
  const [projectString, setProjectString] = useState("");
  const [customLoading, setCustomLoading] = useState({
    save: false,
    update: false,
    delete: false,
  });

  useEffect(() => {
    getProjectDatabase();
  }, []);

  const dbstringArrayMaster = useMemo(() => {
    const dbString = data?.masterString ? decrypt(data?.masterString) : "";
    return dbString?.split(":");
  }, [data?.masterString]);

  const dbstringArrayProject = useMemo(() => {
    const dbString = data?.projectString ? decrypt(data?.projectString) : "";
    return dbString?.split(":");
  }, [data?.projectString]);

  const getProjectDatabase = async (loading = true) => {
    setLoading(loading);
    await getProjectDatabaseApi(projectId)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSave = async () => {
    setCustomLoading({
      ...customLoading,
      save: true,
    });
    let updatedString = projectString;
    if (projectString[projectString.length - 1] !== "/") {
      updatedString = projectString + "/";
    }
    await saveProjectDatabaseApi(projectId, {
      fetchData: "project",
      dbString: encrypt(updatedString),
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        setProjectString("");
        getProjectDatabase(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setCustomLoading({
          ...customLoading,
          save: false,
        });
      });
  };

  const handleUpdate = async (value) => {
    setCustomLoading({
      ...customLoading,
      update: true,
    });
    await updateProjectDatabaseApi(projectId, {
      fetchData: value,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProjectDatabase(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setCustomLoading({
          ...customLoading,
          update: false,
        });
      });
  };

  const handleDelete = async () => {
    setCustomLoading({
      ...customLoading,
      delete: true,
    });
    await deleteProjectDatabaseApi(projectId)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProjectDatabase(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setCustomLoading({
          ...customLoading,
          delete: false,
        });
      });
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        border: "2px solid",
        borderColor: "background.default",
        borderRadius: "1rem",
        backgroundColor: "background.foreground",
      }}
    >
      <Box
        className="flex gap-4 items-center justify-between"
        sx={{
          padding: "1rem",
          backgroundColor: "background.foreground",
          borderBottom: "2px solid",
          borderColor: "background.default",
          borderRadius: "1rem 1rem 0 0",
        }}
      >
        <Typography variant="h5">Project Database</Typography>
        {data?.projectString && (
          <Button
            size="small"
            variant="contained"
            onClick={handleDelete}
            disabled={customLoading["delete"]}
            endIcon={
              customLoading["delete"] && (
                <CircularProgress color="loading" size={24} />
              )
            }
            color="error"
          >
            DISCONNECT PROJECT DATABASE
          </Button>
        )}
      </Box>

      <Box sx={{ padding: "1rem", height: "calc(100vh - 11.5rem)" }}>
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress color="secondary" size={24} />
          </Box>
        ) : (
          <>
            {!data?.projectString && (
              <>
                <Box className="flex flex-col gap-4">
                  <Typography variant="h6">
                    Connect Database to project
                  </Typography>
                  <Box className="flex flex-col gap-4 justify-center items-center">
                    <CustomInput
                      label="Database Connection String"
                      placeholder="MongoDB Connection String"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <GestureRoundedIcon color="secondary" />
                            </InputAdornment>
                          ),
                        },
                      }}
                      required
                      name="projectString"
                      //   value={data?.projectString}
                      onChange={(event) => {
                        setProjectString(event.target.value);
                      }}
                      disabled={customLoading["save"]}
                      onPaste={(event) => {
                        setProjectString(event.target.value);
                      }}
                    />
                    <Button
                      variant="contained"
                      disabled={customLoading["save"]}
                      endIcon={
                        customLoading["save"] && (
                          <CircularProgress color="loading" size={24} />
                        )
                      }
                      onClick={() => {
                        handleSave();
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>
                <br />
                <br />
                <Divider className="w-full" />
                <br />
                <br />
              </>
            )}
            <Grid2 container spacing={2}>
              {data?.projectString && (
                <Grid2 item size={{ xs: 12, md: 6 }}>
                  <>
                    <Box className="flex flex-col gap-4 w-[100%]">
                      <Typography variant="h6">
                        Connected Database details (Project)
                      </Typography>
                      <Box
                        sx={{
                          borderRadius: "0.5rem 1.5rem 1.5rem 0.5rem",
                          border: "0.01rem solid",
                          borderColor: "background.invert",
                          backgroundColor: "background.default",
                          padding: "0.2rem 0.2rem 0.2rem 0.5rem",
                          display: "flex",
                          alignItems: "center",
                          width: "fit-content",
                        }}
                      >
                        <Typography
                          variant="h7"
                          sx={{
                            display: "block",
                            wordBreak: "break-all",
                          }}
                        >
                          {dbstringArrayProject[0]}:{dbstringArrayProject[1]}
                          :**your-password**@
                          {dbstringArrayProject[2]?.split("@")[1]}
                        </Typography>
                        <IconButton
                          onClick={() => {
                            navigator.clipboard.writeText(
                              decrypt(data?.projectString)
                            );
                            showNotification({
                              content: "Copied to clipboard",
                              type: "success",
                            });
                          }}
                          sx={{
                            background: "none",
                            backgroundColor: "background.defaultSolid",
                            marginLeft: "0.5rem",
                          }}
                        >
                          <ContentCopyOutlined />
                        </IconButton>
                      </Box>
                    </Box>
                    <br />
                  </>
                </Grid2>
              )}
              {data?.masterString && (
                <Grid2 item size={{ xs: 12, md: 8, lg: 6 }}>
                  <Box className="flex flex-col gap-4 w-[100%]">
                    <Typography variant="h6">
                      Connected Database details (Master)
                    </Typography>
                    <Box
                      sx={{
                        borderRadius: "0.5rem 1.5rem 1.5rem 0.5rem",
                        border: "0.01rem solid",
                        borderColor: "background.invert",
                        backgroundColor: "background.default",
                        padding: "0.2rem 0.2rem 0.2rem 0.5rem",
                        display: "flex",
                        alignItems: "center",
                        width: "fit-content",
                      }}
                    >
                      <Typography
                        variant="h7"
                        sx={{
                          display: "block",
                          wordBreak: "break-all",
                        }}
                      >
                        {dbstringArrayMaster[0]}:{dbstringArrayMaster[1]}
                        :**your-password**@
                        {dbstringArrayMaster[2]?.split("@")[1]}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(
                            decrypt(data?.masterString)
                          );
                          showNotification({
                            content: "Copied to clipboard",
                            type: "success",
                          });
                        }}
                        sx={{
                          background: "none",
                          backgroundColor: "background.defaultSolid",
                          marginLeft: "0.5rem",
                        }}
                      >
                        <ContentCopyOutlined />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid2>
              )}
            </Grid2>
            <br />

            <Grid2 container spacing={2}>
              <Grid2
                item
                size={{ xs: 12, md: 8, lg: 6 }}
                className="flex gap-3 flex-col"
                sx={{
                  borderRadius: "0.5rem",
                  backgroundColor: "background.default",
                  padding: "1rem",
                }}
              >
                <FormControl>
                  <div className="flex gap-4 items-center mb-2">
                    <FormLabel id="radio-buttons-group-label">
                      Select from which database your apis will fetch and save
                      data
                    </FormLabel>
                    {customLoading.update && (
                      <CircularProgress color="secondary" size={16} />
                    )}
                  </div>
                  <RadioGroup
                    row
                    aria-labelledby="radio-buttons-group-label"
                    name="radio-buttons-group"
                    value={data.fetchData}
                    onChange={(event) => handleUpdate(event.target.value)}
                  >
                    <FormControlLabel
                      value="master"
                      control={
                        <Radio
                          sx={{
                            color: "checkbox",
                            "&.Mui-checked": {
                              color: "checkbox",
                            },
                          }}
                        />
                      }
                      label="Master Database"
                    />
                    <FormControlLabel
                      value="self"
                      control={
                        <Radio
                          sx={{
                            color: "checkbox",
                            "&.Mui-checked": {
                              color: "checkbox",
                            },
                          }}
                        />
                      }
                      label="Our Database"
                    />
                    {data?.projectString && (
                      <FormControlLabel
                        value="project"
                        control={
                          <Radio
                            sx={{
                              color: "checkbox",
                              "&.Mui-checked": {
                                color: "checkbox",
                              },
                            }}
                          />
                        }
                        label="Project Database"
                      />
                    )}
                  </RadioGroup>
                </FormControl>
              </Grid2>
            </Grid2>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProjectDatabase;
