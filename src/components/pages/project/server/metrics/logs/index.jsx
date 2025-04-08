import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import socket from "@/utilities/helpers/socket";
import { getProjectLogsApi } from "@/utilities/api/projectApi";
import { catchError } from "@/utilities/helpers/functions";

const Logs = ({ environment, projectId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs([]);
    
    socket.on("logs" + projectId + environment, (logs) => {
      const raw = logs.data;

      // Strip control characters (Docker multiplexed stream headers)
      const cleaned = raw
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // remove unprintable chars
        .trim()
        // Remove the timestamp and IP address pattern (e.g., 2025-04-06T12:03:44.346473253Z 172.18.0.2)
        .replace(/^\S+\s+\S+\s+\S+\s+/g, ""); // Remove timestamp and IP address at the beginning of each line

      console.log(cleaned.split("\n"));

      // Split logs by new line
      const lines = cleaned.split("\n");

      // Use the functional form of setLogs to append to the previous logs
      setLogs((prevLogs) => [...prevLogs, ...lines]);
    });

    return () => {
      socket.off("logs" + projectId + environment);
    };
  }, [projectId, environment]);

  return (
    <div className="p-4 bg-black text-white font-mono text-sm overflow-y-auto min-h-[500px] max-h-[800px] rounded mx-4">
      <Typography variant="h6" className="mb-2 text-white">
        Live Logs
      </Typography>
      <div className="flex flex-col gap-2 items-start">
        {logs.length === 0 ? (
          <Typography variant="body2">No logs yet...</Typography>
        ) : (
          logs.map((log, index) => (
            <Typography
              key={index}
              className="whitespace-pre-wrap"
              variant="body2"
            >
              {log.includes('"-"') ? log.split('"-"')[0] : log}
            </Typography>
          ))
        )}
      </div>
    </div>
  );
};

export default Logs;
