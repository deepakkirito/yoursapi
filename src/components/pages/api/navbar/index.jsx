"use client";
import CustomSelect from "@/components/common/customSelect";
import { showNotification } from "@/components/common/notification";
import {
  checkApiExistApi,
  createApiApi,
  deleteApiApi,
  updateApiNameApi,
} from "@/utilities/api/apiApi";
import { CreatePopupContext } from "@/utilities/context/popup";
import {
  Add,
  ArrowDownwardRounded,
  ContentCopyRounded,
  DeleteRounded,
  SaveRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Grid2,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import {
  checkProjectExistApi,
  getSingleProjectApi,
  updateProjectNameApi,
} from "@/utilities/api/projectApi";
import CustomInput from "@/components/common/customTextField";
import TooltipCustom from "@/components/common/tooltip";
import { catchError } from "@/utilities/helpers/functions";
import { CheckUsernameApi } from "@/utilities/api/authApi";
import { updateUsernameApi } from "@/utilities/api/userApi";
import { useRouter } from "next/navigation";
import { CreateNavTitleContext } from "@/utilities/context/navTitle";
import useCustomWindow from "@/utilities/helpers/hooks/window";
import AddProject from "../../project/addProject";
import { deleteAuthApi, updateAuthApi } from "@/utilities/api/authApiApi";
import { CreateAlertContext } from "@/utilities/context/alert";

const Navbar = ({
  title = "",
  shared = false,
  endpoint = "",
  query = false,
  auth = {
    name: "",
    id: "",
  },
  refetch = () => {},
  openApi,
  setOpenApi = () => {},
}) => {
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
  const apiId = searchparams.get("id");
  const { setNavTitle } = useContext(CreateNavTitleContext);
  const window = useCustomWindow();
  const [authData, setAuthData] = useState({
    name: auth?.name || "",
    id: auth?.id || "",
  });
  const [permission, setPermission] = useState("read");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { alert, setAlert } = useContext(CreateAlertContext);

  useEffect(() => {
    if (apiData?.label) {
      router.push(
        `/projects/${shared ? "shared/" : ""}${projectId}/${endpoint}${query ? `?api=${apiData.label}&id=${apiData.value}` : ""}`,
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

  const getSingleProject = async (id, create = false, loading = true) => {
    loading && setLoading(true);
    await getSingleProjectApi(id)
      .then((res) => {
        setProject(res.data.name);
        setCurrentProject(res.data.name);
        setUsername(res.data.username);
        setCurrentUsername(res.data.username);
        setApiList(res.data.apiIds);
        setApiData(
          !create && apiId
            ? res.data.apiIds.find((item) => item?.value === apiId)
            : res.data.apiIds[apiName === "" ? 0 : res.data.apiIds?.length - 1]
        );
        setApiName(
          !create && apiId
            ? res.data.apiIds.find((item) => item.value === apiId)?.label
            : res.data.apiIds[apiName === "" ? 0 : res.data.apiIds.length - 1]
                ?.label
        );
        setPermission(res.data.permission);
      })
      .catch((err) => {
        catchError(err);
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
      projectname: project,
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
    await updateUsernameApi({
      username: username,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
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
        getSingleProject(projectId, true, false);
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
        await getSingleProject(projectId, false, false);
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
    apiName !== apiData?.label && handleCheckApiName();
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

  const handleUpdateAuthApiName = async () => {
    setSaveApiLoading(true);
    await updateAuthApi(authData.id, {
      name: authData.name,
    })
      .then(async (res) => {
        showNotification({
          content: res.data.message,
        });
        refetch(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setSaveApiLoading(false);
      });
  };

  const handleDeleteApi = () => {
    setDeleteLoading(true);
    deleteApiApi(apiId)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        refetch(false);
        getSingleProject(projectId, true, false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const handleDeleteAuthApi = () => {
    setDeleteLoading(true);
    deleteAuthApi(auth.id)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        refetch(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  return (
    <>
      <Box
        className="flex items-center justify-between"
        sx={{
          backgroundColor: "background.foreground",
          borderRadius: "0.5rem 0.5rem 0 0",
          padding: "1rem",
          borderBottom: "0.2rem solid",
          borderColor: "background.default",
        }}
      >
        <Typography variant="h5">{title}</Typography>
        <div className="flex gap-2 items-center">
          <Typography variant="h7">{!openApi ? "Hide" : "Show"} api</Typography>
          <IconButton onClick={() => setOpenApi(!openApi)}>
            <ArrowDownwardRounded
              color="secondary"
              sx={{
                transform: openApi ? "rotate(-180deg)" : "rotate(0deg)",
                transition: "all 0.5s",
              }}
            />
          </IconButton>
          <Button variant="contained" size="small">
            Docs &gt;
          </Button>
        </div>
      </Box>
      <Grid2
        container
        alignItems={"center"}
        spacing={2}
        sx={{
          backgroundColor: "background.foreground",
          borderBottom: openApi ? "none" : "0.2rem solid",
          borderColor: "background.default",
          padding: openApi ? "0rem" : "1rem",
          position: {
            lg: "sticky",
            xs: "relative",
          },
          top: "0",
          zIndex: "5",
          width: "100%",
          height: openApi ? "0rem" : "5rem",
          overflow: openApi ? "hidden" : "auto",
          transition: "all 0.5s",
          borderRadius: "0.5rem 0.5rem 0 0",
        }}
      >
        {loading && (
          <Grid2 item size={{ xs: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                width: "max-content",
              }}
            >
              Your Api:
            </Typography>
          </Grid2>
        )}
        {loading ? (
          <CircularProgress color="secondary" size={24} />
        ) : (
          <Grid2
            item
            size={{
              xs: 12,
              md: query
                ? (apiId || !query) && !shared
                  ? 9.5
                  : 10
                : (apiId || !query) && !shared
                  ? 11.5
                  : 12,
            }}
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
              <Typography
                variant="h6"
                className="pr-2"
                sx={{
                  minWidth: "max-content",
                  maxWidth: "-webkit-fill-available",
                }}
              >
                Your Api:
              </Typography>
              <Typography>{window?.location.origin}/</Typography>
              <CustomInput
                fullWidth
                value={username}
                label="Username"
                type="text"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  readOnly: shared,
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
                inputProps={{
                  readOnly: shared ? permission !== "admin" : false,
                }}
                disabled={saveProjectLoading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <TooltipCustom
                          title="Save project name"
                          placement="top"
                        >
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
              {Boolean(apiId || !query) && (
                <CustomInput
                  fullWidth
                  value={auth?.name ? authData.name : apiName}
                  label={auth?.name ? "Auth api" : "Api"}
                  InputLabelProps={{ shrink: true }}
                  disabled={saveApiLoading}
                  inputProps={{
                    readOnly: shared ? permission !== "admin" : false,
                  }}
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
                                (auth?.name
                                  ? auth?.name === authData?.name
                                  : apiName === apiData?.label)
                              }
                              onClick={() => {
                                auth?.name
                                  ? handleUpdateAuthApiName()
                                  : handleUpdateApiName();
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
                    auth?.name
                      ? setAuthData({ ...authData, name: event.target.value })
                      : setApiName(event.target.value);
                  }}
                />
              )}
              <TooltipCustom title="Copy Link">
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window?.location.origin}/${username}/${project}/${apiData.label}`
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
        {query && !loading && (
          <Grid2
            item
            size={{ xs: 6, md: 2 }}
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <CustomSelect
              options={apiList}
              value={apiData?.value}
              none={false}
              labelTop="Api List"
              buttonLabel="Create more Api"
              buttonDisable={shared ? permission !== "admin" : false}
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
                )?.label;
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
        {(apiId || !query) && !shared && !loading && (
          <Grid2
            item
            size={{ xs: 6, md: 0.5 }}
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <IconButton
              disabled={deleteLoading}
              onClick={() => {
                setAlert({
                  open: true,
                  title: "Are you Sure?",
                  content:
                    "Deleting the api will remove all the data associated with it, we suggest you to copy the data before deleting to prevent any loss of data.",
                  handleClose: () => {
                    setAlert({ ...alert, open: false });
                  },
                  handleSuccess: () => {
                    !query ? handleDeleteAuthApi() : handleDeleteApi();
                    setAlert({ ...alert, open: false });
                  },
                });
              }}
            >
              {deleteLoading ? (
                <CircularProgress size={16} color="secondary" />
              ) : (
                <DeleteRounded color="error" />
              )}
            </IconButton>
          </Grid2>
        )}
      </Grid2>
    </>
  );
};

export default Navbar;
