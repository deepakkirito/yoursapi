"use client";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid2,
  IconButton,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  getProjectLogsApi,
  getSingleProjectApi,
  startProjectInstanceApi,
  stopProjectInstanceApi,
} from "@/utilities/api/projectApi";
import { usePathname } from "next/navigation";
import { catchError, getDate } from "@/utilities/helpers/functions";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import CustomTabs from "@/components/pages/project/server/customTabs";
import { serverBar } from "@/components/assets/constants/project";
import TooltipCustom from "@/components/common/tooltip";
import { ArrowDownwardRounded, CopyAllRounded } from "@mui/icons-material";
import Pricing from "@/components/pages/project/server/pricing";
import PlanDetails from "@/components/pages/project/server/planDetails";
import CustomSelect from "@/components/common/customSelect";
import { CreateServerTabContext } from "@/utilities/context/serverTab";
import { showNotification } from "@/components/common/notification";
import { CreateProjectDataContext } from "@/utilities/context/projectData";
import Link from "next/link";

export default function Layout({ children, shared, projectId }) {
  const { environment, setEnvironment, projectData, setProjectData } =
    useContext(CreateProjectDataContext);
  const { activeTab, setActiveTab } = useContext(CreateServerTabContext);
  const [showPricing, setShowPricing] = useState(false);
  const [planDetails, setPlanDetails] = useState({});
  const [instanceLoading, setInstanceLoading] = useState(false);
  const [mainLoading, setMainLoading] = useState(false);

  useEffect(() => {
    getProject();
  }, [environment, projectId, shared]);

  const getProject = async () => {
    setMainLoading(true);
    await getSingleProjectApi(projectId.current, environment)
      .then((res) => {
        if (res.data) {
          setProjectData(res.data);
        } else {
          setProjectData(null);
        }
      })
      .catch((err) => {
        catchError(err);
        setProjectData(null);
      })
      .finally(() => {
        setMainLoading(false);
      });
  };

  const getRam = (ram) => {
    if (ram >= 1) {
      return `${ram} GB`;
    } else {
      return `${ram * 1024} MB`;
    }
  };

  const activeSubscription = useMemo(() => {
    if (!projectData) return "";
    const planData = projectData?.data?.activeSubscription?.data;
    return `${getRam(planData?.ram?.data)} RAM | ${planData?.cpus?.data} CPUs | ${planData?.disk} GB ${planData?.diskType} Disk`;
  }, [projectData]);

  const instanceStatus = useMemo(() => {
    return projectData?.data?.instance?.status;
  }, [projectData]);

  const handleStartInstance = async () => {
    setInstanceLoading(true);
    await startProjectInstanceApi(projectId.current, environment)
      .then(async (res) => {
        showNotification({
          content: res.data.message,
        });
        getProject();
        await getProjectLogsApi(projectId.current, environment);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setInstanceLoading(false);
      });
  };

  const handleStopInstance = async () => {
    setInstanceLoading(true);
    await stopProjectInstanceApi(projectId.current, environment)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProject();
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setInstanceLoading(false);
      });
  };

  return (
    <Box
      className="h-[inherit] w-full"
      sx={{
        border: "0.2rem solid",
        borderTop: "0.1rem solid",
        borderLeft: "0.1rem solid",
        borderColor: "divider",
        overflow: {
          xs: "auto",
          md: "hidden",
        },
      }}
    >
      <div className="h-[inherit]">
        <Box
          sx={{
            backgroundColor: "background.foreground",
            padding: "0.25rem 1rem",
            borderBottom: "0.1rem solid",
            borderColor: "divider",
          }}
        >
          <Grid2
            container
            spacing={{ xs: 0, md: 2, lg: 4 }}
            className="items-center"
          >
            <Grid2
              item
              size={{ xs: 12, md: 4, lg: 6 }}
              className="flex gap-2 items-center py-2"
            >
              <CustomTabs
                projectId={projectId.current}
                shared={shared}
                tabs={serverBar.youpiapi}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                disabled={showPricing}
              />
              {mainLoading && <CircularProgress size={16} color="secondary" />}
            </Grid2>

            <Grid2
              item
              size={{ xs: 12, md: 8, lg: 6 }}
              className="flex gap-4 items-center justify-end overflow-x-auto overflow-y-hidden py-2"
              sx={{
                flexDirection: {
                  xs: "column",
                  md: "row",
                },
              }}
            >
              <Box className="flex gap-2 items-center">
                <Typography
                  variant="h8"
                  sx={{
                    color: "text.primary",
                  }}
                >
                  {activeSubscription}
                </Typography>
                <TooltipCustom title={"Choose Plan"} placement="top">
                  <IconButton
                    onClick={() => setShowPricing(!showPricing)}
                    sx={{
                      transform: showPricing
                        ? "rotate(0deg)"
                        : "rotate(180deg)",
                      transition: "all 0.5s",
                    }}
                  >
                    <ArrowDownwardRounded color="secondary" />
                  </IconButton>
                </TooltipCustom>
              </Box>
              <Box className="flex gap-2 items-center">
                <CustomSelect
                  labelTop={"Environment"}
                  options={[
                    { label: "Production", value: "production" },
                    { label: "Development", value: "development" },
                  ]}
                  disabled={instanceLoading}
                  none={false}
                  size="small"
                  fullWidth={false}
                  value={environment}
                  handleChange={(event) => setEnvironment(event.target.value)}
                />
                <Button
                  variant="contained"
                  color={instanceStatus ? "error" : "success"}
                  size="small"
                  disabled={instanceLoading}
                  onClick={
                    instanceStatus ? handleStopInstance : handleStartInstance
                  }
                  endIcon={instanceLoading && <CircularProgress size={16} />}
                >
                  {instanceStatus ? "Stop Instance" : "Start Instance"}
                </Button>
              </Box>
            </Grid2>
          </Grid2>
        </Box>
        <Box
          className="p-2"
          sx={{
            visibility: showPricing ? "visible" : "hidden",
            height: showPricing ? "inherit" : "0",
            overflow: showPricing ? "auto" : "hidden",
            borderBottom: "0.1rem solid",
            borderColor: "divider",
            transition: "all 0.5s",
            "& .MuiTypography-root": {
              color: "text.primary",
            },
          }}
        >
          <div className="flex gap-2 items-center">
            <Typography variant="h7">Select Plan</Typography>
            <Typography variant="h8">
              (Last modified:{" "}
              {getDate(projectData?.data?.activeSubscription?.updatedAt)})
            </Typography>
          </div>
          <Pricing
            data={projectData}
            projectId={projectId.current}
            setPlanDetails={setPlanDetails}
            planDetails={planDetails}
            status={instanceStatus || instanceLoading}
            environment={environment}
            handleRefetch={() => getProject()}
          />
          <br />
          <Divider className="w-full" />
          <br />
          <Typography variant="h7">Plan Details</Typography>
          {planDetails && Object.keys(planDetails).length > 0 && (
            <PlanDetails data={planDetails} />
          )}
        </Box>
        {projectData && (
          <>
            <div className="flex gap-2 items-start px-4 pb-4">
              <Typography
                variant="h8"
                sx={{
                  color: "text.primary",
                }}
              >
                Domains:
              </Typography>
              <div className="flex gap-2 items-start flex-row flex-wrap">
                <div className="flex gap-2 items-center">
                  <Typography
                    variant="h8"
                    color="common.link"
                    component={Link}
                    target="_blank"
                    href={`http://${projectData?.name}-${projectData?.userId?.username}${environment === "development" ? "-dev" : ""}.youpi.${process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "com" : "pro"}`}
                  >
                    http://{projectData?.name}-{projectData?.userId?.username}
                    {environment === "development" ? "-dev" : ""}.youpi.
                    {process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
                      ? "com"
                      : "pro"}
                  </Typography>
                  <CopyAllRounded
                    color="secondary"
                    fontSize="small"
                    className="cursor-pointer"
                    onClick={() => {
                      showNotification({
                        content: `Copied to clipboard`,
                      });
                      navigator.clipboard.writeText(
                        `http://${projectData?.name}-${projectData?.userId?.username}${
                          environment === "development" ? "-dev" : ""
                        }.youpi.${
                          process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
                            ? "com"
                            : "pro"
                        }`
                      );
                    }}
                  />
                </div>
                {projectData?.domains?.length > 0 && (
                  <div className="flex gap-2 items-start flex-row flex-wrap">
                    {projectData?.domains?.map((domain, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Typography
                          variant="h8"
                          className="flex gap-2 items-center"
                          color="common.link"
                          component={Link}
                          target="_blank"
                          href={`http://${domain.name}${environment === "development" ? "-dev" : ""}.youpi.${process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "com" : "pro"}`}
                        >
                          http://{domain.name}
                          {environment === "development" ? "-dev" : ""}.youpi.
                          {process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
                            ? "com"
                            : "pro"}
                        </Typography>
                        <CopyAllRounded
                          color="secondary"
                          fontSize="small"
                          className="cursor-pointer"
                          onClick={() => {
                            showNotification({
                              content: `Copied to clipboard`,
                            });
                            navigator.clipboard.writeText(
                              `http://${domain.name}${
                                environment === "development" ? "-dev" : ""
                              }.youpi.${
                                process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
                                  ? "com"
                                  : "pro"
                              }`
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Divider className="w-[99%] m-auto mb-2" />
          </>
        )}
        <Box
          sx={{
            overflow: {
              xs: "auto",
              md: "hidden",
            },
          }}
        >
          {children}
        </Box>
      </div>
    </Box>
  );
}
