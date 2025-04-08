import Recharts from "@/components/common/recharts";
import { getProjectMetricsApi } from "@/utilities/api/projectApi";
import { catchError } from "@/utilities/helpers/functions";
import { Divider, Typography, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Lottie from "react-lottie";
import ChartLoading from "@/components/assets/json/chartLoading.json";

const Performance = ({ environment, projectId, projectData }) => {
  const [metrics, setMetrics] = useState(null);
  const { palette } = useTheme();
  const [activeLabel, setActiveLabel] = useState("");
  const [hardActiveLabel, setHardActiveLabel] = useState({
    label: null,
    color: null,
  });

  useEffect(() => {
    getMetrics();
    const interval = setInterval(() => {
      getMetrics();
    }, 10000);
    return () => clearInterval(interval);
  }, [environment, projectId]);

  const getMetrics = () => {
    console.log(projectId);

    getProjectMetricsApi(projectId, environment)
      .then((res) => {
        setMetrics(res.data);
      })
      .catch((err) => {
        // catchError(err);
        setMetrics(null);
      });
  };

  const toolTipLabels = {
    "cpu-user": "CPU User",
    "cpu-sys": "CPU System",
    cpuTotal: "CPU Total",
    memory: "Memory Used",
    "memory-usage": "Memory Usage",
    "memory-limit": "Memory Limit",
    "data-received": "Data Received",
    "data-sent": "Data Sent",
    processes: "Running Processes",
  };

  // Flatten the nested logs for Recharts
  const flattenedLogs = useMemo(() => {
    if (!metrics) return [];
    return metrics.logs.map((log) => ({
      timestamp: new Date(log.timestamp).toLocaleTimeString(), // x-axis label
      "cpu-user": +(log.cpu.user / 1e9).toFixed(2), // seconds
      "cpu-sys": +(log.cpu.sys / 1e9).toFixed(2), // seconds
      cpuTotal: +(log.cpu.total / 1e9).toFixed(2), // seconds
      memory: +log.memory.percent.toFixed(2), // percent
      "memory-usage": +(log.memory.usage / 1024 / 1024).toFixed(2), // MB
      "memory-limit": +(log.memory.limit / 1024 / 1024).toFixed(2), // MB
      "data-received": +(log.network.rx / 1024).toFixed(2), // KB
      "data-sent": +(log.network.tx / 1024).toFixed(2), // KB
      processes: log.processes,
    }));
  }, [metrics]);

  return (
    <div>
      {!metrics ? (
        <div
          style={{
            transform: "translateX(-5rem)",
          }}
        >
          {!projectData?.data?.instance?.status && (
            <Typography variant="h8" className="flex items-center justify-center">
              Start the instance to see performance
            </Typography>
          )}
          <Lottie
            options={{
              animationData: ChartLoading,
              loop: true,
              autoPlay: true,
            }}
            height={700}
            width={700}
          />
        </div>
      ) : (
        <div className="px-2 pb-12 max-h-[calc(100vh-11rem)] overflow-auto">
          <Recharts
            data={flattenedLogs}
            XAxisKey="timestamp"
            label="%"
            toolTipLabels={toolTipLabels}
            YAxisKeys={["cpu-user", "cpu-sys", "memory"]}
          />
          <br />
          <Divider className="w-full" />
          <br />
          <Recharts
            data={flattenedLogs}
            XAxisKey="timestamp"
            label="MB"
            toolTipLabels={toolTipLabels}
            YAxisKeys={["memory-usage", "memory-limit"]}
          />
          <br />
          <Divider className="w-full" />
          <br />
          <Recharts
            data={flattenedLogs}
            XAxisKey="timestamp"
            label="KB"
            toolTipLabels={toolTipLabels}
            YAxisKeys={["data-received", "data-sent"]}
          />
          <br />
          <Divider className="w-full" />
          <br />
          <Recharts
            data={flattenedLogs}
            XAxisKey="timestamp"
            label="Processes"
            toolTipLabels={toolTipLabels}
            YAxisKeys={["processes"]}
          />
        </div>
      )}
    </div>
  );
};

export default Performance;
