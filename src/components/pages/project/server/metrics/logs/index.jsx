import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import socket from "@/utilities/helpers/socket";
import {
  getProjectLogsApi,
  getProjectMetricsApi,
} from "@/utilities/api/projectApi";
import { catchError, getDate } from "@/utilities/helpers/functions";
import TooltipCustom from "@/components/common/tooltip";

const Logs = ({ environment, projectId, status, period }) => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => getLogs(), [projectId, environment, status, period]);

  const getLogs = () => {
    getProjectMetricsApi(projectId, environment, "logs", period)
      .then((res) => {
        let test = [];
        if (res.data.logs?.length > 0) {
          res.data.logs.forEach((log) => {
            test = [getParsed(log), ...test];
          });
          setLogs(test);
        } else {
          setLogs([]);
        }
      })
      .catch((err) => {
        setLogs([]);
      });
  };

  const getParsed = (log) => {
    try {
      const parsed = JSON.parse(log.message);
      console.log("Parsed log:", parsed);

      return {
        timestamp: log.timestamp,
        message: parsed,
      };
    } catch (err) {
      return {
        timestamp: log.timestamp,
        message: log.message,
      };
    }
  };

  useEffect(() => {
    setLogs([]);

    const logEventName = `logs${projectId}${environment}`;

    socket.on(logEventName, (logs) => {
      let raw = logs.data;

      setLogs((prevLogs) => [getParsed(raw), ...prevLogs]);
    });

    return () => {
      socket.off(logEventName);
    };
  }, [projectId, environment]);

  function getStatusColor(statusCode) {
    if (statusCode >= 200 && statusCode < 300) {
      return "green"; // Success
    } else if (statusCode >= 300 && statusCode < 400) {
      return "blue"; // Redirects
    } else if (statusCode >= 400 && statusCode < 500) {
      return "orange"; // Client errors
    } else if (statusCode >= 500) {
      return "red"; // Server errors
    } else {
      return "gray"; // Unknown or informational
    }
  }

  const renderLog = (log, index) => {
    if (typeof log.message === "string") {
      return (
        <Box
          className="w-full"
          sx={{
            padding: "0.5rem",
            border: "1px solid",
            borderColor: "background.default",
            borderRadius: "0.5rem",
          }}
        >
          {getDate(log?.timestamp)} - {log?.message}
        </Box>
      );
    }

    return (
      <>
        <Box
          className="w-full cursor-pointer"
          sx={{
            padding: "0.5rem",
            border: "1px solid",
            borderColor: "background.default",
            borderRadius: "0.5rem",
            transition: "all 0.5s",
            backgroundColor: selectedLog === index ? "background.default" : "",
            "&:hover": {
              backgroundColor: "background.default",
            },
          }}
          onClick={() =>
            setSelectedLog((prev) => (prev === index ? null : index))
          }
        >
          {getDate(log?.timestamp)} - {log?.message?.req?.headers?.host} -{" "}
          {log?.message?.req?.method}{" "}
          <span
            style={{ color: getStatusColor(log?.message?.res?.statusCode) }}
          >
            {log?.message?.res?.statusCode}
          </span>{" "}
          PATH {log?.message?.req?.url} - {log?.message?.responseTime} ms
        </Box>
        {selectedLog === index && (
          <Box
            className="w-full mt-2 flex flex-col gap-2"
            sx={{
              padding: "0.5rem",
              border: "1px solid",
              borderColor: "background.default",
              borderRadius: "0.5rem",
              backgroundColor: "background.default",
            }}
          >
            <Box className="flex gap-0 items-start flex-col w-[25rem] overflow-hidden">
              <Typography
                variant="body2"
                className="bg-black px-4 py-2"
                sx={{
                  borderRadius: "0.5rem 0.5rem 0 0",
                  color: "whitesmoke",
                }}
              >
                Request started at {getDate(log?.timestamp)}
              </Typography>
              <div
                className="flex gap-2 items-start overflow-hidden bg-black px-4 py-2 flex-col w-[25rem]"
                style={{
                  borderRadius: "0 0.5rem 0.5rem 0.5rem",
                }}
              >
                <div className="flex gap-2 items-center">
                  <Typography variant="body2" width="5rem">
                    User Agent
                  </Typography>
                  <TooltipCustom
                    title={log?.message?.req?.headers?.["user-agent"]}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        width: "18rem",
                      }}
                    >
                      {log?.message?.req?.headers?.["user-agent"]}
                    </Typography>
                  </TooltipCustom>
                </div>
                <div className="flex gap-2 items-center">
                  <Typography variant="body2" width="5rem">
                    Host
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log?.message?.req?.headers?.host}
                  </Typography>
                </div>
                <div className="flex gap-2 items-center">
                  <Typography variant="body2" width="5rem">
                    Path
                  </Typography>
                  <TooltipCustom title={log?.message?.req?.url}>
                    <Typography
                      variant="body2"
                      sx={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {log?.message?.req?.url.split("?")[0]}
                    </Typography>
                  </TooltipCustom>
                </div>
                {log?.message?.req?.params &&
                  Object.keys(log?.message?.req?.params)?.length > 0 && (
                    <div className="flex gap-2 items-center">
                      <Typography variant="body2" width="5rem">
                        Params
                      </Typography>
                      <TooltipCustom
                        title={getStructuredObject(log?.message?.req?.params)}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getStructuredObject(log?.message?.req?.params)}
                        </Typography>
                      </TooltipCustom>
                    </div>
                  )}
                {log?.message?.req?.query &&
                  Object.keys(log?.message?.req?.query)?.length > 0 && (
                    <div className="flex gap-2 items-center">
                      <Typography variant="body2" width="5rem">
                        Query
                      </Typography>
                      <TooltipCustom
                        title={getStructuredObject(log?.message?.req?.query)}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getStructuredObject(log?.message?.req?.query)}
                        </Typography>
                      </TooltipCustom>
                    </div>
                  )}
              </div>
            </Box>
          </Box>
        )}
      </>
    );
  };

  const getStructuredObject = (data) => {
    let updatedString = "";
    const objectLength = Object.keys(data).length;

    Object.keys(data).forEach((key, index) => {
      updatedString += `${key} = ${data[key]} ${objectLength > index + 1 ? "&" : ""} `;
    });

    return updatedString;
  };

  return (
    <div
      className="bg-black font-mono text-sm overflow-y-auto min-h-[500px] max-h-[calc(100vh-15.5rem)] rounded mx-4 pb-4"
      style={{
        color: "whitesmoke",
      }}
    >
      <Typography
        variant="h6"
        className="mb-2 sticky top-0 z-10 bg-black px-4 py-2"
      >
        Live Logs
      </Typography>
      <div className="flex flex-col gap-2 items-start px-4">
        {logs.length === 0 ? (
          <Typography variant="body2">No logs yet...</Typography>
        ) : (
          logs.map((log, index) => (
            <Box
              key={index}
              className="whitespace-pre-wrap w-full"
              variant="body2"
            >
              {renderLog(log, index)}
            </Box>
          ))
        )}
      </div>
    </div>
  );
};

export default Logs;
