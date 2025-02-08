"use client";
import CustomSelect from "@/components/common/customSelect";
import { showNotification } from "@/components/common/notification";
import {
  checkApiExistApi,
  createApiApi,
  updateApiNameApi,
} from "@/utilities/api/apiApi";
import { CreatePopupContext } from "@/utilities/context/popup";
import { Add, ContentCopyRounded, SaveRounded } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Grid2,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import AddProject from "../../../project/addProject";
import {
  checkProjectExistApi,
  getSingleProjectApi,
  updateProjectNameApi,
} from "@/utilities/api/projectApi";
import CustomInput from "@/components/common/customTextField";
import TooltipCustom from "@/components/common/tooltip";
import { catchError } from "@/utilities/helpers/functions";
import { CheckUsernameApi } from "@/utilities/api/authApi";
import { updateUserApi } from "@/utilities/api/userApi";
import { useRouter } from "next/navigation";
import {
  CreateNavTitleContext,
  NavTitleContext,
} from "@/utilities/context/navTitle";
import useCustomWindow from "@/utilities/helpers/hooks/window";

const Navbar = ({ shared = false }) => {
  const { popup, setPopup } = useContext(CreatePopupContext);
  const location = usePathname();
  const router = useRouter();
  const projectId = shared ? location.split("/")[3] : location.split("/")[2];
  const [apiList, setApiList] = useState([]);
  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [project, setProject] = useState("");
  const [currentProject, setCurrentProject] = useState("");
  const [apiData, setApiData] = useState({
    label: "",
    value: "",
  });
  const [loading, setLoading] = useState(false);
  const [saveProjectLoading, setSaveProjectLoading] = useState(false);
  const [saveUsernameLoading, setSaveUsernameLoading] = useState(false);
  const [usernameExists, setUsernameExists] = useState(null);
  const [projectExists, setProjectExists] = useState(null);
  const [saveApiLoading, setSaveApiLoading] = useState(false);
  const [apiExists, setApiExists] = useState(null);
  const [apiName, setApiName] = useState("");
  const searchparams = useSearchParams();
  const api = searchparams.get("api");
  const apiId = searchparams.get("id");
  const { setNavTitle } = useContext(CreateNavTitleContext);
  const nextWindow = useCustomWindow();

  useEffect(() => {
    if (apiData?.label) {
      router.push(
        `/projects/${shared ? "shared/" : ""}${projectId}/data?api=${apiData.label}&id=${apiData.value}`,
        undefined,
        {
          shallow: true,
        }
      );
    }
  }, [apiData, router]);

  useEffect(() => {
    getSingleProject(projectId);
  }, []);

  useEffect(() => {
    setNavTitle(project);
  }, [currentProject]);

  const getSingleProject = async (id, create = false) => {
    setLoading(true);
    await getSingleProjectApi(id)
      .then((res) => {
        setProject(res.data.name);
        setCurrentProject(res.data.name);
        setUsername(res.data.username);
        setCurrentUsername(res.data.username);
        setApiList(res.data.apiIds);
        setApiData(
          !create && apiId
            ? res.data.apiIds.find((item) => item.value === apiId)
            : res.data.apiIds[apiName === "" ? 0 : res.data.apiIds.length - 1]
        );
        setApiName(
          !create && apiId
            ? res.data.apiIds.find((item) => item.value === apiId).label
            : res.data.apiIds[apiName === "" ? 0 : res.data.apiIds.length - 1]
                .label
        );
      })
      .catch((err) => {
        showNotification({
          content: err.response.data.message,
          type: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    project !== currentProject && handleCheckProjectName();
  }, [project]);

  const handleCheckProjectName = async () => {
    await checkProjectExistApi(project)
      .then((res) => {
        setProjectExists(true);
        showNotification({
          content: "Project name already exists",
          type: "error",
        });
      })
      .catch((err) => {
        setProjectExists(false);
      });
  };

  const handleUpdateProjectName = async (id) => {
    setSaveProjectLoading(true);
    await updateProjectNameApi(id, {
      projectName: project,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        setCurrentProject(project);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setSaveProjectLoading(false);
      });
  };

  useEffect(() => {
    username !== currentUsername && checkUsername();
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
          showNotification({
            content: "Username already exists",
            type: "error",
          });
        }
      });
  };

  const handleUpdateUsername = async () => {
    setSaveUsernameLoading(true);
    await updateUserApi({
      username: username,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setSaveUsernameLoading(false);
      });
  };

  const handleCreateApi = (name, data) => {
    const body = {
      apiName: name,
      data: data,
      projectName: currentProject,
    };
    createApiApi(projectId, body)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getSingleProject(projectId, true);
        setPopup({
          open: false,
        });
      })
      .catch((err) => {
        catchError(err);
      });
  };

  const handleUpdateApiName = async () => {
    setSaveApiLoading(true);
    await updateApiNameApi(apiData.value, {
      newApiName: apiName,
      oldApiName: apiData.label,
      projectName: currentProject,
      projectId: projectId,
    })
      .then(async (res) => {
        showNotification({
          content: res.data.message,
        });
        await getSingleProject(projectId);
        setApiData({ ...apiData, label: apiName });
        setApiName(apiName);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setSaveApiLoading(false);
      });
  };

  useEffect(() => {
    apiName !== apiData.label && handleCheckApiName();
  }, [apiName]);

  const handleCheckApiName = async () => {
    await checkApiExistApi(projectId, apiName)
      .then((res) => {
        if (res.status === 200) {
          setApiExists(true);
          showNotification({
            content: "Api name already exists",
            type: "error",
          });
        }
      })
      .catch((err) => {
        setApiExists(false);
      });
  };

  return (
    <Grid2 container alignItems={"center"} spacing={2}>
      <Grid2 item size={{ xs: 1 }}>
        <Typography
          variant="h6"
          sx={{
            width: "max-content",
          }}
        >
          Your Api:
        </Typography>
      </Grid2>
      {loading ? (
        <CircularProgress color="secondary" size={24} />
      ) : (
        <Grid2
          item
          size={{ xs: 12, md: 8 }}
          sx={{
            "& .MuiInputBase-input": {
              padding: "0.5rem 0rem 0.5rem 1rem !important",
            },
          }}
        >
          <Box
            className="flex items-center"
            sx={{
              flexDirection: {
                xs: "column !important",
                md: "row !important",
              },
            }}
          >
            <Typography>{nextWindow?.location.origin}/</Typography>
            <CustomInput
              fullWidth
              value={username}
              label="Username"
              type="text"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setUsername(event.target.value.toLowerCase());
              }}
              disabled={saveUsernameLoading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <TooltipCustom title="Save Username" placement="top">
                        <IconButton
                          aria-label="save username"
                          edge="end"
                          disabled={
                            saveUsernameLoading ||
                            usernameExists ||
                            username === currentUsername
                          }
                          onClick={() => {
                            handleUpdateUsername();
                          }}
                          sx={{
                            "&.Mui-disabled": {
                              opacity: 0.3,
                            },
                          }}
                        >
                          {saveUsernameLoading ? (
                            <CircularProgress size={16} color="secondary" />
                          ) : (
                            <SaveRounded color="secondary" />
                          )}
                        </IconButton>
                      </TooltipCustom>
                    </InputAdornment>
                  ),
                },
              }}
            />
            /
            <CustomInput
              fullWidth
              value={project}
              label="Project Name"
              type="text"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setProject(event.target.value);
              }}
              disabled={saveProjectLoading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <TooltipCustom title="Save project name" placement="top">
                        <IconButton
                          aria-label="save project name"
                          edge="end"
                          disabled={
                            saveProjectLoading ||
                            project === currentProject ||
                            projectExists
                          }
                          onClick={() => {
                            handleUpdateProjectName(projectId);
                          }}
                          sx={{
                            "&.Mui-disabled": {
                              opacity: 0.3,
                            },
                          }}
                        >
                          {saveProjectLoading ? (
                            <CircularProgress size={16} color="secondary" />
                          ) : (
                            <SaveRounded color="secondary" />
                          )}
                        </IconButton>
                      </TooltipCustom>
                    </InputAdornment>
                  ),
                },
              }}
            />
            /
            <CustomInput
              fullWidth
              value={apiName}
              label="Api"
              InputLabelProps={{ shrink: true }}
              disabled={saveApiLoading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <TooltipCustom title="Save Api name" placement="top">
                        <IconButton
                          aria-label="save Api name"
                          edge="end"
                          disabled={
                            saveApiLoading ||
                            apiExists ||
                            apiName === apiData.label
                          }
                          onClick={() => {
                            handleUpdateApiName();
                          }}
                          sx={{
                            "&.Mui-disabled": {
                              opacity: 0.3,
                            },
                          }}
                        >
                          {saveApiLoading ? (
                            <CircularProgress size={16} color="secondary" />
                          ) : (
                            <SaveRounded color="secondary" />
                          )}
                        </IconButton>
                      </TooltipCustom>
                    </InputAdornment>
                  ),
                },
              }}
              onChange={(event) => {
                setApiName(event.target.value);
              }}
            />
            <TooltipCustom title="Copy Link">
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${nextWindow?.location.origin}/${username}/${project}/${apiData.label}`
                  );
                  showNotification({
                    content: "Link copied to clipboard",
                  });
                }}
              >
                <ContentCopyRounded color="secondary" />
              </IconButton>
            </TooltipCustom>
          </Box>
        </Grid2>
      )}
      {!loading && (
        <Grid2
          item
          size={{ xs: 3 }}
          sx={{
            display: "flex",
            justifyContent: "end",
          }}
        >
          <CustomSelect
            options={apiList}
            value={apiData.value}
            none={false}
            labelTop="Api List"
            buttonLabel="Create more Api"
            handleButton={() =>
              setPopup({
                ...popup,
                open: true,
                title: "Create New Api",
                element: (
                  <AddProject
                    project={project}
                    projectId={projectId}
                    handleCreateApi={handleCreateApi}
                  />
                ),
              })
            }
            handleChange={(event) => {
              const name = apiList.find(
                (item) => item.value === event.target.value
              ).label;
              event.target.value &&
                setApiData({
                  value: event.target.value,
                  label: name,
                });
              event.target.value && setApiName(name);
            }}
          />
        </Grid2>
      )}
    </Grid2>
  );
};

export default Navbar;
