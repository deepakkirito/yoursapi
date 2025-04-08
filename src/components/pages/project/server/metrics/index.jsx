import { getProjectMetricsApi } from "@/utilities/api/projectApi";
import { catchError } from "@/utilities/helpers/functions";
import { Grid2, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Logs from "./logs";
import ProjectLogs from "./projectLogs";
import Performance from "./performance";
import { usePathname, useRouter } from "next/navigation";

const Links = [
  {
    label: "Logs",
    value: "logs",
  },
  {
    label: "Project",
    value: "project",
  },
  {
    label: "Performance",
    value: "performance",
  },
];

const Metrics = ({ projectId, environment, projectData, shared }) => {
  const [activeTab, setActiveTab] = useState("logs");
  const router = useRouter();

  useEffect(() => {
    projectId &&
      router.push(
        `/projects/${shared ? "shared/" : ""}${projectId}/metrics/${activeTab}`
      );
  }, [activeTab, projectId, shared]);

  const renderLinks = useMemo(() => {
    switch (activeTab) {
      case "logs":
        return <Logs environment={environment} projectId={projectId} />;
      case "project":
        return <ProjectLogs projectId={projectId} environment={environment} />;
      case "performance":
        return (
          <Performance
            environment={environment}
            projectId={projectId}
            projectData={projectData}
          />
        );
    }
  }, [activeTab, environment, projectId, projectData]);

  return (
    <div className="h-[inherit]">
      <Grid2 container spacing={2} className="items-start">
        <Grid2
          item
          size={{ xs: 12, md: 1.5 }}
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
        <Grid2 item size={{ xs: 12, md: 10.5 }}>
          {renderLinks}
        </Grid2>
      </Grid2>
    </div>
  );
};

export default Metrics;
