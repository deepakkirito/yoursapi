import { getProjectMetricsApi } from "@/utilities/api/projectApi";
import { catchError } from "@/utilities/helpers/functions";
import { Box, Grid2, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Domains from "./domains";
import Environment from "./environment";
import EnvironmentVariables from "./environmentVariables";
import { useRouter } from "next/navigation";

const Links = [
  {
    label: "Domains",
    value: "domains",
  },
  {
    label: "Environment",
    value: "environment",
  },
  {
    label: "Environment Variables",
    value: "environmentVariables",
  },
];

const Settings = ({
  projectId,
  environment,
  projectData,
  setProjectData,
  shared,
}) => {
  const [activeTab, setActiveTab] = useState("domains");
  const router = useRouter();

  useEffect(() => {
    projectId &&
      router.push(
        `/projects/${shared ? "shared/" : ""}${projectId}/settings/${activeTab}`
      );
  }, [activeTab, projectId, shared]);

  const instanceStatus = useMemo(() => {
    return projectData?.data?.instance?.status;
  }, [projectData]);

  const renderLinks = useMemo(() => {
    switch (activeTab) {
      case "domains":
        return (
          <Domains
            projectData={projectData}
            projectId={projectId}
            environment={environment}
            setProjectData={setProjectData}
            instanceStatus={instanceStatus}
          />
        );
      case "environment":
        return (
          <Environment
            projectData={projectData}
            projectId={projectId}
            environment={environment}
            setProjectData={setProjectData}
            instanceStatus={instanceStatus}
          />
        );
      case "environmentVariables":
        return (
          <EnvironmentVariables
            projectData={projectData}
            projectId={projectId}
            environment={environment}
            setProjectData={setProjectData}
            instanceStatus={instanceStatus}
          />
        );
    }
  }, [activeTab, environment, projectId, projectData]);

  return (
    <div className="h-[inherit]">
      <Grid2 container spacing={2} className="items-start">
        <Grid2
          item
          size={{ xs: 12, md: 2 }}
          className="flex items-start"
          sx={{
            flexDirection: {
              xs: "row",
              md: "column",
            },
            padding: {
              xs: "1rem",
              md: "1rem",
              lg: "1rem 3rem",
            },
            gap: {
              xs: "2rem",
              md: "1rem",
            },
          }}
        >
          {Links.map((item, index) => (
            <Typography
              onClick={() => setActiveTab(item.value)}
              variant="h8"
              key={index}
              sx={(theme) => ({
                cursor: "pointer",
                transform: activeTab === item.value ? "scale(1.2)" : "scale(1)",
                textShadow:
                  activeTab === item.value
                    ? "0 0 0.3rem " + theme.palette.reverse
                    : "0 0 0rem transparent",
                transition: "all 0.5s",
              })}
            >
              {item.label}
            </Typography>
          ))}
        </Grid2>
        <Grid2 item size={{ xs: 12, md: 10 }}>
          <Box
            sx={{
              borderRadius: "0.5rem",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
              padding: "1rem",
              marginRight: "1rem",
              maxHeight: "calc(100vh - 13.5rem)",
            }}
          >
            {renderLinks}
          </Box>
        </Grid2>
      </Grid2>
    </div>
  );
};

export default Settings;
