import {
  Box,
  CircularProgress,
  Grid2,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import {
  downloadCsvApi,
  getGraphDataApi,
  getGraphLiveDataApi,
} from "@/utilities/api/graphApi";
import {
  ArrowDownwardRounded,
  DownloadRounded,
  RefreshOutlined,
} from "@mui/icons-material";
import { catchError } from "@/utilities/helpers/functions";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import CustomSelect from "@/components/common/customSelect";
import TooltipCustom from "@/components/common/tooltip";
import CustomMenu from "@/components/common/customMenu";
import CustomInput from "@/components/common/customTextField";
import LiveTvTwoToneIcon from "@mui/icons-material/LiveTvTwoTone";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import { graphColors } from "@/components/assets/constants/color";
import {
  toolTipLabels,
  typeOptions,
} from "@/components/assets/constants/graph";

const Chart = ({ getProjectsApi, title, getLiveApi }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("7");
  const [type, setType] = useState([]);
  const [project, setProject] = useState([]);
  const [api, setApi] = useState([]);
  const [totalProjects, setTotalProjects] = useState([]);
  const { palette } = useTheme();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [projectsUsed, setProjectsUsed] = useState([]);
  const [hide, setHide] = useLocalStorage(title, true);
  const [live, setLive] = useLocalStorage(title + "live", true);
  const [refresh, setRefresh] = useState(false);
  const [splitGraph, setSplitGraph] = useState("project");
  const [updatedSplit, setUpdatedSplit] = useState("");
  const [activeLabel, setActiveLabel] = useState("");
  const [hardActiveLabel, setHardActiveLabel] = useState({
    label: null,
    color: null,
  });
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    !loading && setUpdatedSplit(splitGraph);
  }, [loading]);

  const totalApisOptions = useMemo(() => {
    let total = [];
    totalProjects.forEach((item) => {
      total.push(...item.apis);
    });
    return total.map((item) => ({
      label: item.name,
      value: item._id,
    }));
  }, [totalProjects]);

  const apisOptions = useMemo(() => {
    // let apiArray = [];
    !project?.length && setApi([]);
    const options = totalProjects
      .filter((item) => project.includes(item._id)) // Only include relevant projects
      .map((item) => ({
        label: item.name,
        value: item._id,
        options: item.apis.map((api) => {
          // apiArray.push(api._id);
          return {
            label: api.name,
            value: api._id,
          };
        }),
      }));
    // setApi(apiArray);
    return options;
  }, [totalProjects, project]);

  const projectsOptions = useMemo(() => {
    // let projectArray = [];
    const options = totalProjects.map((item) => {
      // projectArray.push(item._id);
      return {
        label: item.name,
        value: item._id,
      };
    });
    // setProject(projectArray);
    return options;
  }, [totalProjects]);

  const getGraphData = async (from = "", to = "") => {
    setLoading(true);
    getGraphDataApi(period, type, project, api, from, to)
      .then((res) => {
        setData(res.data.data);
        setProjectsUsed(res.data.fullData);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getLiveGraphData = async () => {
    setLoading(true);
    getLiveApi(type, project, api, splitGraph)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const downloadCSVLive = async () => {
    try {
      setDownloadLoading(true);

      const res = await downloadCsvApi(type, project, api);

      if (!res || !res.data) {
        throw new Error("No data received for CSV download");
      }

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `detailed_logs.csv`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      catchError(err);
    } finally {
      setDownloadLoading(false);
    }
  };

  useEffect(() => {
    getGraphProjects();
  }, []);

  useEffect(() => {
    if (hide) return;

    if (!live) getGraphData();

    if (live) {
      setRefresh(true);
      setTimeout(() => setRefresh(false), 500);

      // Refresh data every 30 seconds
      var interval = setInterval(() => {
        setRefresh(true);
        setTimeout(() => setRefresh(false), 500);
      }, 30000);
    }
    return () => clearInterval(interval); // Cleanup on unmount or `live` change
  }, [live, hide]);

  useEffect(() => {
    if (hide) return;

    refresh && getLiveGraphData();
  }, [refresh, hide]);

  const getGraphProjects = async () => {
    setLoading(true);
    getProjectsApi()
      .then((res) => {
        setTotalProjects(res.data);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    live ? getLiveGraphData() : getGraphData();
  }, [period, type, project, api, splitGraph]);

  const downloadCSV = (data) => {
    const headers = [
      "Date,Project Total Used,Project Name,API Name,Head Used,Get Used,Post Used,Put Used,Patch Used,Delete Used,Api Total Used",
    ];

    const rows = projectsUsed.flatMap((row) =>
      row.projectsUsed.flatMap((project) =>
        project.apiUsed.map(
          (api) =>
            `${row.createdAt},${row.projectTotalUsed},"${project.name}","${api.name}",${api.headUsed},${api.getUsed},${api.postUsed},${api.putUsed},${api.patchUsed},${api.deleteUsed},${api.apiTotalUsed}`
        )
      )
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `project-data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const customLabel = ({ x, y, value }) => (
    <text
      x={x - 2}
      y={y}
      dy={-10}
      fill={palette.text.primary}
      fontSize={12}
      textAnchor="end"
    >
      {value}
    </text>
  );

  const getLines = useMemo(() => {
    // Ensure project, api, and type are always arrays
    const projectArray = Array.isArray(project) ? project : [];
    const apiArray = Array.isArray(api) ? api : [];
    const typeArray = Array.isArray(type) ? type : [];

    if (hardActiveLabel?.label) {
      return (
        <Line
          type="monotone"
          dataKey={hardActiveLabel.label}
          strokeWidth={3}
          stroke={hardActiveLabel.color}
          label={customLabel}
        />
      );
    }

    if (updatedSplit === "project") {
      return projectsOptions.map((item, index) => {
        if (!projectArray.length || projectArray.includes(String(item.value))) {
          return (
            <Line
              key={item.value}
              type="monotone"
              dataKey={item.label}
              strokeWidth={activeLabel === item.label ? 3 : 1}
              stroke={
                graphColors[
                  palette.mode === "light" ? "lightMode" : "darkMode"
                ][index]
              }
              label={activeLabel === item.label ? customLabel : null}
            />
          );
        }
        return null;
      });
    } else if (updatedSplit === "api") {
      let array = [];

      if (projectArray.length) {
        apisOptions.forEach((item) => {
          if (projectArray.includes(String(item.value))) {
            array = [...array, ...item.options];
          }
        });
      } else {
        array = totalApisOptions;
      }

      return array.map((item, index) => {
        if (!apiArray.length || apiArray.includes(String(item.value))) {
          return (
            <Line
              key={item.value}
              type="monotone"
              dataKey={item.label}
              strokeWidth={activeLabel === item.label ? 3 : 1}
              stroke={
                graphColors[
                  palette.mode === "light" ? "lightMode" : "darkMode"
                ][index]
              }
              label={activeLabel === item.label ? customLabel : null}
            />
          );
        }
        return null;
      });
    } else if (updatedSplit === "type") {
      return typeOptions.map((item, index) => {
        if (!typeArray.length || typeArray.includes(String(item.value))) {
          return (
            <Line
              key={item.value}
              type="monotone"
              dataKey={item.value + "Request"}
              strokeWidth={activeLabel === item.value + "Request" ? 3 : 1}
              stroke={
                graphColors[
                  palette.mode === "light" ? "lightMode" : "darkMode"
                ][index]
              }
              label={
                activeLabel === item.value + "Request" ? customLabel : null
              }
            />
          );
        }
        return null;
      });
    } else {
      return (
        <Line
          type="monotone"
          dataKey="totalUsed"
          strokeWidth={activeLabel === "totalUsed" ? 3 : 1}
          stroke={palette.text.primary}
          label={activeLabel === "totalUsed" ? customLabel : null}
        />
      );
    }
  }, [
    updatedSplit,
    totalApisOptions,
    projectsOptions,
    palette,
    activeLabel,
    hardActiveLabel,
    project,
    api,
    apisOptions,
    type,
    typeOptions,
  ]);

  const CustomLegend = (props) => {
    return (
      <div
        style={{ maxHeight: 60, overflowY: "auto" }}
        className="flex justify-center"
      >
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexWrap: "wrap",
            textAlign: "center",
          }}
        >
          {props.payload.map((entry, index) => (
            <li
              key={`legend-item-${index}`}
              style={{ marginRight: 10 }}
              onMouseOver={() => setActiveLabel(entry.dataKey)}
              onMouseOut={() => setActiveLabel("")}
              onClick={() =>
                setHardActiveLabel({
                  label:
                    entry.dataKey === hardActiveLabel.label
                      ? null
                      : entry.dataKey,
                  color:
                    entry.dataKey === hardActiveLabel.label
                      ? null
                      : entry.color,
                })
              }
            >
              <span style={{ color: entry.color }}>⬤</span> {entry.value}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Box>
      <Grid2
        container
        spacing={2}
        className="items-center"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "0.5rem",
          padding: "1rem",
          backgroundColor: "background.default",
          position: "sticky",
          top: "0",
          zIndex: "5",
          backdropFilter: "blur(10px)",
        }}
      >
        <Grid2 item size={{ xs: 4 }} className="flex items-center gap-2">
          <Typography
            fontWeight={"bold"}
            fontSize={{
              xs: "0.8rem",
              sm: "1.2rem",
            }}
          >
            {title}
          </Typography>
          <TooltipCustom title={live ? "Live on" : "Live off"} placement="top">
            <IconButton
              disabled={hide}
              onClick={() => {
                setLive(!live);
              }}
            >
              {live ? (
                <LiveTvTwoToneIcon
                  color="secondary"
                  sx={{ opacity: hide ? 0.5 : 1 }}
                />
              ) : (
                <LiveTvRoundedIcon
                  color="secondary"
                  sx={{ opacity: hide ? 0.5 : 1 }}
                />
              )}
            </IconButton>
          </TooltipCustom>
          {live && (
            <TooltipCustom
              title="Auto refresh every 30 seconds"
              placement="top"
            >
              <IconButton
                disabled={hide}
                onClick={() => {
                  setRefresh(true);
                  setTimeout(() => {
                    setRefresh(false);
                  }, 500);
                }}
              >
                <RefreshOutlined
                  color="secondary"
                  sx={{
                    transform: refresh ? "rotate(360deg)" : "rotate(0deg)",
                    transition: "all 0.5s",
                    opacity: hide ? 0.5 : 1,
                  }}
                />
              </IconButton>
            </TooltipCustom>
          )}
          <TooltipCustom title={!hide ? "Hide" : "Show"} placement="top">
            <IconButton onClick={() => setHide(!hide)}>
              <ArrowDownwardRounded
                color="secondary"
                sx={{
                  transform: hide ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "all 0.5s",
                }}
              />
            </IconButton>
          </TooltipCustom>
          {loading && <CircularProgress color="secondary" size={20} />}
        </Grid2>
        <Grid2
          item
          size={{ xs: 8 }}
          className="flex items-center gap-2 overflow-x-auto pt-2"
          sx={{
            scrollbarWidth: "none",
          }}
        >
          <CustomSelect
            labelTop="Project"
            multiple
            options={projectsOptions}
            value={project}
            none={false}
            disabled={hide}
            handleChange={(value) => setProject(value)}
          />
          <CustomSelect
            labelTop="Api"
            multiple
            grouped
            disabled={hide}
            options={apisOptions}
            value={api}
            none={false}
            handleChange={(value) => setApi(value)}
          />

          <CustomSelect
            labelTop="Request Type"
            multiple
            options={typeOptions}
            value={type}
            none={false}
            disabled={hide}
            handleChange={(value) => setType(value)}
          />
          {!live && (
            <CustomSelect
              labelTop="Usage Period"
              options={[
                { label: "Last 7 days", value: "7" },
                { label: "Last 30 days", value: "30" },
                { label: "Last 90 days", value: "90" },
                { label: "Last year", value: "365" },
              ]}
              value={period}
              none={false}
              disabled={dateFrom || dateTo || hide}
              handleChange={(event) => setPeriod(event.target.value)}
            />
          )}
          {live && (
            <CustomSelect
              labelTop="Split Graph by"
              options={[
                { label: "Project", value: "project" },
                { label: "Api", value: "api" },
                { label: "Request Type", value: "type" },
              ]}
              value={splitGraph}
              disabled={hide}
              handleChange={(event) => setSplitGraph(event.target.value)}
            />
          )}
          <CustomMenu
            icon={<CalendarMonthIcon />}
            iconSize="medium"
            optionsShow={false}
            stopClose={true}
            menuPosition="right"
            disabledIcon={hide}
          >
            <div className="flex flex-col gap-2 p-4 pb-0 items-center">
              <CustomInput
                type="date"
                label="From"
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />

              <CustomInput
                type="date"
                label="To"
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />

              <div className="flex gap-2 items-center">
                <TooltipCustom title="Apply" placement="left">
                  <IconButton
                    disabled={!dateFrom && !dateTo}
                    onClick={() => getGraphData(dateFrom, dateTo)}
                  >
                    <CheckCircleRoundedIcon />
                  </IconButton>
                </TooltipCustom>
                <TooltipCustom title="Clear" placement="right">
                  <IconButton
                    disabled={!dateFrom && !dateTo}
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                      getGraphData("", "");
                    }}
                  >
                    <HighlightOffRoundedIcon />
                  </IconButton>
                </TooltipCustom>
              </div>
            </div>
          </CustomMenu>
          {downloadLoading ? (
            <div className="px-2">
              <CircularProgress color="secondary" size={20} />
            </div>
          ) : (
            <TooltipCustom title="Download CSV" placement="top">
              <IconButton
                onClick={live ? downloadCSVLive : downloadCSV}
                disabled={!data?.length || hide}
                sx={{
                  ":disabled": {
                    opacity: 0.3,
                  },
                }}
              >
                <DownloadRounded color="secondary" />
              </IconButton>
            </TooltipCustom>
          )}
        </Grid2>
      </Grid2>
      <br />
      {data?.length > 0 ? (
        <div className="w-full h-full pl-4 pr-8">
          <ResponsiveContainer
            width="100%"
            height={!hide ? 350 : 0}
            style={{
              transition: "all 0.5s",
            }}
          >
            <LineChart data={data}>
              {getLines}
              <XAxis
                dataKey="createdAt"
                tick={{ fill: palette.text.primary }}
                tickLine={{ stroke: palette.text.primary }}
                axisLine={{ stroke: palette.text.primary }}
              />
              <YAxis
                tick={{ fill: palette.text.primary }}
                tickLine={{ stroke: palette.text.primary }}
                axisLine={{ stroke: palette.text.primary }}
                label={{
                  value: "Requests used",
                  angle: -90,
                  position: "insideLeft",
                  fill: palette.text.primary,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: palette.background.defaultSolid,
                  color: palette.text.primary,
                  borderRadius: "0.5rem",
                }}
                itemStyle={{ color: palette.text.primary }}
                cursor={{ stroke: "transparent", strokeWidth: 1 }}
                formatter={(value, name) => [
                  value > 0 ? `${value} requests` : "No requests",
                  toolTipLabels[name] || name,
                ]}
              />
              <Legend
                content={<CustomLegend />}
                verticalAlign="bottom"
                align="center"
                // onMouseOver={(event) => setActiveLabel(event.dataKey)}
                // onMouseOut={() => setActiveLabel("")}
                // onClick={(event) =>
                //   setHardActiveLabel({
                //     label:
                //       event.dataKey === hardActiveLabel.label
                //         ? null
                //         : event.dataKey,
                //     color:
                //       event.dataKey === hardActiveLabel.label
                //         ? null
                //         : event.color,
                //   })
                // }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{
            height: !hide ? 300 : 0,
            transition: "all 0.5s",
            overflow: !hide ? "auto" : "hidden",
          }}
        >
          <Typography variant="h6" fontWeight={"bold"}>
            No data available
          </Typography>
        </div>
      )}
    </Box>
  );
};

export default Chart;
