import CustomSelect from "@/components/common/customSelect";
import CustomInput from "@/components/common/customTextField";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid2,
  IconButton,
  InputAdornment,
  Slider,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import SupportIcon from "@mui/icons-material/Support";
import { showNotification } from "@/components/common/notification";
import TooltipCustom from "@/components/common/tooltip";
import {
  DeleteRounded,
  InfoOutlined,
  UploadFileRounded,
  UploadRounded,
} from "@mui/icons-material";
import { nodeVersions } from "@/components/assets/constants/instance";
import {
  getProjectInstanceApi,
  startProjectInstanceApi,
  stopProjectInstanceApi,
  updateProjectInstanceApi,
} from "@/utilities/api/projectApi";
import { usePathname } from "next/navigation";
import { catchError } from "@/utilities/helpers/functions";

const requiredDependencyList = ["express"];

const ProjectInstance = ({ shared = false }) => {
  const [dependencies, setDependencies] = useState(["express"]);
  const [environmentVariables, setEnvironmentVariables] = useState({
    PORT: "3000",
  });
  const [environment, setEnvironment] = useState({
    key: "",
    value: "",
  });
  const [nodeVersion, setNodeVersion] = useState("node:18-alpine");
  const [ramUsage, setRAMUsage] = useState(0);
  const [cpuUsage, setCPUUsage] = useState(0);
  const fileEnvRef = useRef(null);
  const fileDepRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const location = usePathname();
  const locationParts = location.split("/");
  const projectId = shared ? locationParts[3] : locationParts[2];
  const [cpuLimit, setCpuLimit] = useState(0);
  const [ramLimit, setRamLimit] = useState(0);
  const [customLoading, setCustomLoading] = useState({
    node: false,
    cpu: false,
    ram: false,
    env: false,
  });
  const [status, setStatus] = useState(false);

  useEffect(() => {
    getProjectInstance();
  }, []);

  const getProjectInstance = async (loading = true) => {
    setLoading(loading);
    await getProjectInstanceApi(projectId)
      .then((res) => {
        setDependencies([
          ...(res.data.instance.dependencies ?? requiredDependencyList),
        ]);
        setEnvironmentVariables(res.data.instance.environmentVariables);
        setNodeVersion(res.data.instance.nodeVersion);
        setRAMUsage(res.data.instance.ramUsage);
        setCPUUsage(res.data.instance.cpuUsage);
        setCpuLimit(res.data.cpuLimit);
        setRamLimit(res.data.ramLimit);
        setStatus(res.data.instance.status);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateInstance = async (body, loading) => {
    setCustomLoading({
      ...customLoading,
      [loading]: true,
    });
    await updateProjectInstanceApi(projectId, body)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProjectInstance(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setCustomLoading({
          ...customLoading,
          [loading]: false,
        });
      });
  };

  const handleStart = async (loading) => {
    setCustomLoading({
      ...customLoading,
      [loading]: true,
    });
    await startProjectInstanceApi(projectId)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProjectInstance(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setCustomLoading({
          ...customLoading,
          [loading]: false,
        });
      });
  };

  const handleStop = async (loading) => {
    setCustomLoading({
      ...customLoading,
      [loading]: true,
    });
    await stopProjectInstanceApi(projectId)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProjectInstance(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setCustomLoading({
          ...customLoading,
          [loading]: false,
        });
      });
  };

  const getProsCons = useMemo(() => {
    const selectedVersion = nodeVersions.find(
      (item) => item.value === nodeVersion
    );
    return [...(selectedVersion?.pros ?? []), ...(selectedVersion?.cons ?? [])];
  }, [nodeVersion]);

  const getMarksRam = useMemo(() => {
    return Array.from({ length: ramLimit / 512 }, (_, index) => ({
      value: index * (100 / (ramLimit / 512 - 1)),
      label: (index + 1) * 512,
    }));
  }, [ramLimit]);

  const getMarksCPU = useMemo(() => {
    return Array.from({ length: (cpuLimit * 10) / 5 }, (_, index) => ({
      value: index * (100 / ((cpuLimit * 10) / 5 - 1)),
      label: ((index + 1) * 5) / 10,
    }));
  }, [cpuLimit]);

  const handleEnvironmentFile = (event) => {
    if (!event.target.files.length) return; // Prevents errors if no file is selected

    const file = event.target.files[0];

    // Reset file input manually to allow re-uploading the same file
    event.target.value = null;

    // Validate file type
    const allowedExtensions = [".txt", ".env"];
    const fileName = file.name.toLowerCase();
    const isValidFile = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidFile) {
      showNotification({
        content: "Invalid file type. Please select a .txt or .env file.",
        type: "error",
      });
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const text = reader.result;
      const lines = text.split("\n");
      const newEnvironmentVariables = {};

      lines.forEach((line) => {
        const [key, ...rest] = line.split("="); // Support values with '=' in them
        if (key)
          newEnvironmentVariables[key.trim().toUpperCase()] = rest
            .join("=")
            .trim();
      });

      setEnvironmentVariables(newEnvironmentVariables);
    };
  };

  const handleDependencyFile = (event) => {
    if (!event.target.files.length) return; // Prevents errors if no file is selected

    const file = event.target.files[0];

    // Reset file input manually to allow re-uploading the same file
    event.target.value = null;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".json")) {
      showNotification({
        content: "Invalid file type. Please select a .json file.",
        type: "error",
      });
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);

        if (!json.dependencies || typeof json.dependencies !== "object") {
          showNotification({
            content: "Invalid file structure. No dependencies found.",
            type: "error",
          });
          return;
        }

        // Convert dependencies to an array of strings ["package@version"]
        const dependenciesArray = Object.entries(json.dependencies).map(
          ([pkg, version]) => `${pkg}@${version}`
        );

        setDependencies([
          ...dependencies,
          ...dependenciesArray.filter((dep) => !dependencies.includes(dep)),
        ]);
      } catch (error) {
        showNotification({
          content: "Error parsing JSON file. Please check the file format.",
          type: "error",
        });
      }
    };
  };

  const renderEnvironmentVariables = () => {
    return (
      environmentVariables &&
      Object.entries(environmentVariables).map(([key, value]) => (
        <Box
          key={key}
          className="flex gap-4 items-center"
          sx={{
            backgroundColor: "background.default",
            borderRadius: "0.5rem",
            padding: "1rem",
          }}
        >
          <CustomInput
            label="key"
            value={key}
            onChange={(event) => {
              setEnvironmentVariables({
                ...environmentVariables,
                [event.target.value?.toUpperCase()]: value,
              });
            }}
          />
          <CustomInput
            label="value"
            value={value}
            onChange={(event) => {
              setEnvironmentVariables({
                ...environmentVariables,
                [key]: event.target.value,
              });
            }}
          />
          <IconButton
            onClick={() => {
              const newEnvironmentVariables = { ...environmentVariables };
              delete newEnvironmentVariables[key];
              setEnvironmentVariables(newEnvironmentVariables);
            }}
          >
            <DeleteRounded color="error" />
          </IconButton>
        </Box>
      ))
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: "background.foreground",
        border: "2px solid",
        borderColor: "background.default",
        borderRadius: "1rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "1rem",
          backgroundColor: "background.foreground",
          borderBottom: "2px solid",
          borderColor: "background.default",
          borderRadius: "1rem 1rem 0 0",
        }}
      >
        <div className="flex gap-2 items-center">
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Project Instance
          </Typography>
          <TooltipCustom title="Instances are used to run your project on the cloud. This instance will have its own environment variables and dependencies.">
            <InfoOutlined className="mt-1" fontSize="small" />
          </TooltipCustom>
        </div>
        <div className="flex gap-2 items-center">
          <TooltipCustom title="To apply new changes, stop the instance and start a new one.">
            <InfoOutlined fontSize="small" />
          </TooltipCustom>
          <Button
            color={status ? "error" : "success"}
            variant="contained"
            disabled={loading || customLoading.instance}
            endIcon={
              customLoading.instance && (
                <CircularProgress size={16} color="secondary" />
              )
            }
            onClick={() => {
              status ? handleStop("instance") : handleStart("instance");
            }}
          >
            {status ? "Stop Instance" : "Start Instance"}
          </Button>
        </div>
      </Box>
      <Box
        sx={{
          padding: "1rem",
          height: "calc(100vh - 11.5rem)",
          overflow: "auto",
        }}
      >
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress color="secondary" size={24} />
          </Box>
        ) : (
          <>
            {/* NODE Version Section */}
            <Box className="flex flex-col gap-4">
              <Typography variant="h6">Environment Type (Node.js)</Typography>
              <CustomSelect
                labelTop="Select node version"
                value={nodeVersion}
                none={false}
                options={nodeVersions}
                handleChange={(event) => {
                  setNodeVersion(event.target.value);
                }}
              />
            </Box>
            <Box className="flex flex-col">
              <ul className="list-disc pl-4">
                {getProsCons?.map((item, index) => (
                  <li key={index}>
                    <Typography variant="h8">{item}</Typography>
                  </li>
                ))}
              </ul>
            </Box>

            <Box className="flex flex-col gap-4">
              <CustomInput
                placeholder="Type and press enter to add a dependency"
                formLabel={`Dependencies (${dependencies?.length ?? 0})`}
                tooltip="These are the packages that your project needs to run. You can add more dependencies by pressing enter."
                slotProps={{
                  input: {
                    startAdornment: (
                      <SupportIcon
                        color="secondary"
                        sx={{ fontSize: "1.5rem", marginRight: "0.5rem" }}
                      />
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <TooltipCustom title="Upload a package.json file">
                          <IconButton
                            onClick={() => {
                              fileDepRef.current.click();
                            }}
                          >
                            <UploadRounded color="secondary" />
                          </IconButton>
                        </TooltipCustom>
                      </InputAdornment>
                    ),
                  },
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    if (!dependencies.includes(event.target.value)) {
                      setDependencies([...dependencies, event.target.value]);
                    }
                    event.target.value = "";
                  }
                }}
              />
              <input
                type="file"
                hidden
                ref={fileDepRef}
                accept=".json"
                onChange={handleDependencyFile}
              />
              <Box
                className="flex flex-wrap gap-2"
                sx={{
                  backgroundColor: "background.default",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                }}
              >
                {dependencies?.length > 0 &&
                  dependencies.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => {
                        if (requiredDependencyList.includes(item)) {
                          showNotification({
                            content: `${item} is a required dependency`,
                            type: "error",
                          });
                        } else {
                          setDependencies(
                            dependencies.filter((dep) => dep !== item)
                          );
                        }
                      }}
                    />
                  ))}
              </Box>
              <div className="flex gap-2 items-center">
                <Button
                  variant="contained"
                  size="small"
                  disabled={dependencies?.length === 0 || customLoading.node}
                  endIcon={
                    customLoading.node && (
                      <CircularProgress size={16} color="secondary" />
                    )
                  }
                  onClick={() => {
                    handleUpdateInstance(
                      {
                        nodeVersion,
                        dependencies,
                      },
                      "node"
                    );
                  }}
                >
                  Save
                </Button>
                {dependencies?.length > 0 && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setDependencies(requiredDependencyList)}
                    color="error"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </Box>

            <br />
            <Divider className="w-full" textAlign="center" />
            <br />

            {/* RAM and CPU Section */}
            <Grid2 container spacing={8} className="px-4">
              <Grid2
                item
                size={{ xs: 12, md: ramLimit / 512 < 15 ? 6 : 12 }}
                className="flex flex-col gap-4 items-center justify-center"
              >
                <div className="w-full">
                  <div className="flex gap-2 items-center">
                    <Typography variant="h6">RAM Usage</Typography>
                    {customLoading.ram && (
                      <CircularProgress color="secondary" size={16} />
                    )}
                  </div>
                  <Slider
                    defaultValue={0}
                    value={
                      getMarksRam.find((item) => item.label === ramUsage)
                        ?.value ?? 0
                    }
                    step={0}
                    valueLabelDisplay="off"
                    disabled={customLoading.ram}
                    sx={{
                      width: "95%",
                      display: "flex",
                      margin: "0rem auto 1rem",
                    }}
                    marks={getMarksRam}
                    onChange={(event) => {
                      handleUpdateInstance(
                        {
                          ramUsage:
                            getMarksRam.find(
                              (item) => item.value === event.target.value
                            )?.label ?? 0,
                        },
                        "ram"
                      );
                    }}
                  />
                </div>
                <Typography variant="h8">Available RAM (MB)</Typography>
              </Grid2>
              <Grid2
                item
                size={{ xs: 12, md: cpuLimit < 8 ? 6 : 12 }}
                className="flex flex-col gap-4 items-center justify-center"
              >
                <div className="w-full">
                  <div className="flex gap-2 items-center">
                    <Typography variant="h6">CPU Usage</Typography>
                    {customLoading.cpu && (
                      <CircularProgress color="secondary" size={16} />
                    )}
                  </div>
                  <Slider
                    defaultValue={0}
                    value={
                      getMarksCPU.find((item) => item.label === cpuUsage)
                        ?.value ?? 0
                    }
                    step={0}
                    valueLabelDisplay="off"
                    disabled={customLoading.cpu}
                    sx={{
                      width: "95%",
                      display: "flex",
                      margin: "0rem auto 1rem",
                    }}
                    marks={getMarksCPU}
                    onChange={(event) => {
                      handleUpdateInstance(
                        {
                          cpuUsage:
                            getMarksCPU.find(
                              (item) => item.value === event.target.value
                            )?.label ?? 0,
                        },
                        "cpu"
                      );
                    }}
                  />
                </div>
                <Typography variant="h8">Available CPU (cores)</Typography>
              </Grid2>
            </Grid2>

            <br />
            <Divider className="w-full" />
            <br />

            {/* Environment Variables Section */}
            <Box className="flex flex-col gap-4">
              <div className="flex gap-4 items-center justify-between">
                <Typography variant="h6">
                  Environment Variables (
                  {environmentVariables
                    ? (Object.keys(environmentVariables)?.length ?? 0)
                    : 0}
                  )
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    handleUpdateInstance(
                      {
                        environmentVariables,
                      },
                      "env"
                    );
                  }}
                  disabled={customLoading.env}
                  endIcon={
                    customLoading.env && (
                      <CircularProgress size={16} color="secondary" />
                    )
                  }
                >
                  Save
                </Button>
              </div>

              {renderEnvironmentVariables()}

              <Box className="flex gap-4 items-center">
                <CustomInput
                  label="key"
                  value={environment.key}
                  onChange={(event) => {
                    setEnvironment({
                      ...environment,
                      key: event.target.value?.toUpperCase(),
                    });
                  }}
                />
                <CustomInput
                  label="value"
                  value={environment.value}
                  onChange={(event) => {
                    setEnvironment({
                      ...environment,
                      value: event.target.value,
                    });
                  }}
                />
              </Box>
              <Button
                variant="contained"
                disabled={environment.key === "" || environment.value === ""}
                onClick={() => {
                  setEnvironmentVariables({
                    ...environmentVariables,
                    [environment.key]: environment.value,
                  });
                  setEnvironment({
                    key: "",
                    value: "",
                  });
                }}
              >
                Add
              </Button>
            </Box>
            <br />
            <Divider className="w-full" textAlign="center">
              OR
            </Divider>
            <br />
            <Box
              className="flex gap-4 items-center justify-center"
              sx={{
                backgroundColor: "background.default",
                borderRadius: "0.5rem",
                padding: "3rem 1rem",
                cursor: "pointer",
              }}
              onClick={() => {
                fileEnvRef.current.click();
              }}
            >
              <UploadFileRounded color="secondary" fontSize="large" />
              <Typography variant="h6">Upload a file (.env/.txt)</Typography>
              <input
                type="file"
                hidden
                ref={fileEnvRef}
                accept=".txt,.env"
                onChange={handleEnvironmentFile}
              />
            </Box>
            <br />
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProjectInstance;
