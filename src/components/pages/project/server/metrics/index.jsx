import { getProjectMetricsApi } from "@/utilities/api/projectApi";
import { catchError } from "@/utilities/helpers/functions";
import { Box, Grid2, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Logs from "./logs";
import ProjectLogs from "./projectLogs";
import Performance from "./performance";
import { usePathname, useRouter } from "next/navigation";
import CustomSelect from "@/components/common/customSelect";

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
  const [period, setPeriod] = useState("1h");

  useEffect(() => {
    projectId &&
      router.push(
        `/projects/${shared ? "shared/" : ""}${projectId}/metrics/${activeTab}`
      );
  }, [activeTab, projectId, shared]);

  const renderLinks = useMemo(() => {
    switch (activeTab) {
      case "logs":
        return (
          <Logs
            environment={environment}
            projectId={projectId}
            period={period}
            status={projectData?.data?.instance?.status}
          />
        );
      case "project":
        return (
          <ProjectLogs
            projectId={projectId}
            environment={environment}
            period={period}
            status={projectData?.data?.instance?.status}
          />
        );
      case "performance":
        return (
          <Performance
            environment={environment}
            projectId={projectId}
            projectData={projectData}
            period={period}
            status={projectData?.data?.instance?.status}
          />
        );
    }
  }, [activeTab, environment, projectId, projectData, period]);

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
                color: "text.primary",
              })}
            >
              {item.label}
            </Typography>
          ))}
          <CustomSelect
            labelTop={"Period"}
            options={[
              { label: "Last 1 Hour", value: "1h" },
              { label: "Last 6 Hours", value: "6h" },
              { label: "Last 24 Hours", value: "24h" },
              { label: "Last 7 Days", value: "7d" },
              { label: "Last 15 Days", value: "15d" },
            ]}
            size="small"
            fullWidth={false}
            value={period}
            handleChange={(event) => setPeriod(event.target.value)}
          />
        </Grid2>
        <Grid2 item size={{ xs: 12, md: 10.5 }}>
          <Box
            sx={{
              borderRadius: "0.5rem",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
              padding: "1rem 0",
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

export default Metrics;
