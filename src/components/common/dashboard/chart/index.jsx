import { Box, Grid2, IconButton, Typography, useTheme } from "@mui/material";
import CustomSelect from "../../customSelect";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { getGraphDataApi } from "@/components/pages/api/graph";
import { ArrowDownwardRounded, DownloadRounded } from "@mui/icons-material";
import TooltipCustom from "../../tooltip";
import { catchError } from "@/utilities/helpers/functions";
import CustomMenu from "../../customMenu";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CustomInput from "../../customTextField";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";

const Chart = ({ getProjectsApi, title }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("7");
  const [type, setType] = useState([
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
  ]);
  const [project, setProject] = useState([]);
  const [api, setApi] = useState([]);
  const [totalProjects, setTotalProjects] = useState([]);
  const { palette } = useTheme();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [projectsUsed, setProjectsUsed] = useState([]);
  const [hide, setHide] = useLocalStorage(title, false);

  const apisOptions = useMemo(() => {
    let apiArray = [];
    const options = totalProjects
      .filter((item) => project.includes(item._id)) // Only include relevant projects
      .map((item) => ({
        label: item.name,
        value: item._id,
        options: item.apis.map((api) => {
          apiArray.push(api._id);
          return {
            label: api.name,
            value: api._id,
          };
        }),
      }));
    setApi(apiArray);
    return options;
  }, [totalProjects, project]);

  const projectsOptions = useMemo(() => {
    let projectArray = [];
    const options = totalProjects.map((item) => {
      projectArray.push(item._id);
      return {
        label: item.name,
        value: item._id,
      };
    });
    setProject(projectArray);
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

  useEffect(() => {
    getGraphProjects();
  }, []);

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
    getGraphData();
  }, [period, type, project, api]);

  const downloadCSV = (data) => {
    const headers = [
      "Date,Time,Project Total Used,Project Name,API Name,Head Used,Get Used,Post Used,Put Used,Patch Used,Delete Used,Api Total Used",
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
        }}
      >
        <Grid2 item size={{ xs: 4 }} className="flex items-center gap-2">
          <Typography
            variant={{
              xs: "h7",
              sm: "h5",
            }}
            fontWeight={"bold"}
          >
            {title}
          </Typography>
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
            options={[
              { label: "Get", value: "get" },
              { label: "Post", value: "post" },
              { label: "Put", value: "put" },
              { label: "Patch", value: "patch" },
              { label: "Delete", value: "delete" },
            ]}
            value={type}
            none={false}
            disabled={hide}
            handleChange={(value) => setType(value)}
          />
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
          <TooltipCustom title="Download CSV" placement="top">
            <IconButton
              onClick={downloadCSV}
              disabled={!data?.length}
              sx={{
                ":disabled": {
                  opacity: 0.3,
                },
              }}
            >
              <DownloadRounded color="secondary" />
            </IconButton>
          </TooltipCustom>
        </Grid2>
      </Grid2>
      <br />
      {data?.length > 0 ? (
        <div className="w-full h-full pl-4 pr-8">
          <ResponsiveContainer width="100%" height={hide ? 300 : 0}>
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="totalUsed"
                stroke={palette.text.primary}
              />
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
