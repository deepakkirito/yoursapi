import CustomInput from "@/components/common/customTextField";
import { showNotification } from "@/components/common/notification";
import {
  addProjectEnvironmentApi,
  deleteProjectEnvironmentApi,
  getProjectEnvironmentApi,
  updateProjectEnvironmentApi,
} from "@/utilities/api/projectApi/envApi";
import { catchError, getDate } from "@/utilities/helpers/functions";
import {
  AddRounded,
  DeleteRounded,
  EditRounded,
  SaveRounded,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Grid2,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const EnvironmentVariables = ({
  projectId,
  environment,
  projectData,
  setProjectData,
  instanceStatus,
}) => {
  const [envDetails, setEnvDetails] = useState([]);
  const [addEnv, setAddEnv] = useState({
    key: "",
    value: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [showPassword, setShowPassword] = useState([]);
  const [alreadyShown, setAlreadyShown] = useState([]);
  const [saveLoading, setSaveLoading] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState([]);

  useEffect(() => {
    projectId && getEnvDetails();
    setShowPassword([]);
    setAlreadyShown([]);
    setSaveLoading([]);
    setDeleteLoading([]);
  }, [projectId, environment]);

  const getEnvDetails = (envId = "") => {
    getProjectEnvironmentApi({
      id: projectId,
      environment,
      envId: envId,
    })
      .then((res) => {
        if (!envId) {
          setEnvDetails(res.data);
        } else {
          setEnvDetails((prev) => ({
            ...prev,
            data: prev.data.map((item) => {
              if (item.id === res.data.id) {
                return { ...item, ...res.data };
              }
              return item;
            }),
          }));
        }
      })
      .catch((err) => {
        catchError(err);
      });
  };

  const handleAddEnv = async () => {
    setAddLoading(true);
    addProjectEnvironmentApi({
      id: projectId,
      body: addEnv,
      environment,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
          type: "success",
        });
        getEnvDetails();
        setAddEnv({
          key: "",
          value: "",
        });
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setAddLoading(false);
      });
  };

  const handleUpdateEnv = async (envId, body) => {
    setSaveLoading([...saveLoading, envId]);
    updateProjectEnvironmentApi({
      id: projectId,
      body,
      envId,
      environment,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
          type: "success",
        });
        // getEnvDetails(envId);
        setAddEnv({
          key: "",
          value: "",
        });
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setSaveLoading(saveLoading.filter((item) => item !== envId));
      });
  };

  const handleDeleteEnv = async (envId) => {
    setDeleteLoading([...deleteLoading, envId]);
    deleteProjectEnvironmentApi({
      id: projectId,
      envId,
      environment,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
          type: "success",
        });
        getEnvDetails();
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setDeleteLoading(deleteLoading.filter((item) => item !== envId));
      });
  };

  return (
    <div>
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Typography variant="h6">Environment Variables</Typography>
          {envDetails?.updatedAt && (
            <Typography
              variant="h8"
              sx={{
                transform: "translateY(0.15rem)",
              }}
            >
              ( Last Updated: {getDate(envDetails?.updatedAt)} )
            </Typography>
          )}
        </div>
        <Button
          variant="contained"
          size="small"
          onClick={handleAddEnv}
          startIcon={<AddRounded />}
          endIcon={addLoading ? <CircularProgress size={20} /> : null}
          disabled={addEnv.key === "" || addEnv.value === "" || addLoading}
        >
          Add
        </Button>
      </div>
      <br />
      <Grid2 container spacing={2} className="items-start">
        <Grid2 size={{ xs: 12, md: 4 }}>
          <CustomInput
            label="Key"
            size="small"
            value={addEnv.key}
            onChange={(event) =>
              setAddEnv({
                ...addEnv,
                key: event.target.value
                  .toUpperCase()
                  .replace(/\s+/g, " ")
                  .trim(),
              })
            }
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <CustomInput
            label="Value"
            size="small"
            value={addEnv.value}
            onChange={(event) =>
              setAddEnv({ ...addEnv, value: event.target.value })
            }
          />
        </Grid2>
      </Grid2>
      <br />
      <br />
      {envDetails?.data?.length > 0 &&
        envDetails?.data.map((env, index) => (
          <Grid2
            key={index}
            container
            columnSpacing={2}
            className="items-center"
          >
            <Grid2 item size={{ xs: 12, md: 4 }}>
              <CustomInput
                label="Key"
                size="small"
                value={env.key}
                onChange={(event) =>
                  setEnvDetails((prev) => ({
                    ...prev,
                    data: prev.data.map((item) => {
                      if (item.id === env.id) {
                        return {
                          ...item,
                          key: event.target.value
                            .toUpperCase()
                            .replace(/\s+/g, " ")
                            .trim(),
                        };
                      }
                      return item;
                    }),
                  }))
                }
              />
            </Grid2>
            <Grid2 item size={{ xs: 12, md: 8 }} className="flex gap-2">
              <CustomInput
                type={showPassword.includes(env.id) ? "text" : "password"}
                label="Value"
                size="small"
                value={env?.value || ".............."}
                disabled={!showPassword.includes(env.id)}
                onChange={(event) =>
                  setEnvDetails((prev) => ({
                    ...prev,
                    data: prev.data.map((item) => {
                      if (item.id === env.id) {
                        return {
                          ...item,
                          value: event.target.value,
                        };
                      }
                      return item;
                    }),
                  }))
                }
                InputLabelProps={{
                  shrink: true,
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton
                        onClick={() => {
                          !showPassword.includes(env.id) &&
                            !alreadyShown.includes(env.id) &&
                            getEnvDetails(env.id);
                          setShowPassword(
                            showPassword.includes(env.id)
                              ? showPassword.filter((item) => item !== env.id)
                              : [...showPassword, env.id]
                          );
                          setAlreadyShown(
                            alreadyShown.includes(env.id)
                              ? alreadyShown
                              : [...alreadyShown, env.id]
                          );
                        }}
                      >
                        {!showPassword.includes(env.id) ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </IconButton>
                    ),
                  },
                }}
              />
              <IconButton
                onClick={() =>
                  handleUpdateEnv(env.id, {
                    key: env.key,
                    value: env.value,
                  })
                }
                disabled={saveLoading.includes(env.id)}
              >
                {saveLoading.includes(env.id) ? (
                  <CircularProgress size={20} />
                ) : (
                  <SaveRounded color="primary" />
                )}
              </IconButton>
              <IconButton
                onClick={() => handleDeleteEnv(env.id)}
                disabled={deleteLoading.includes(env.id)}
              >
                {deleteLoading.includes(env.id) ? (
                  <CircularProgress size={20} />
                ) : (
                  <DeleteRounded color="error" />
                )}
              </IconButton>
            </Grid2>
            <Grid2 item size={{ xs: 12, md: 12 }}>
              <Typography
                className="flex gap-2 justify-end items-start"
                variant="h8"
              >
                {getDate(env.updatedAt)}
              </Typography>
            </Grid2>
            {envDetails?.data?.length > index + 1 && <br />}
          </Grid2>
        ))}
    </div>
  );
};

export default EnvironmentVariables;
