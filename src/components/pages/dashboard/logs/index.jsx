import { getLogsApi } from "@/utilities/api/logsApi";
import { catchError, isValidJson } from "@/utilities/helpers/functions";
import { Avatar, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CustomTable from "@/components/common/customTable";
import CustomInput from "@/components/common/customTextField";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import useDebounce from "@/utilities/helpers/hooks/useDebounce";

const Logs = () => {
  const [logs, setLogs] = useState({ data: [], totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10 });
  const [filters, setFilters] = useState({});
  const [search, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const router = useRouter();
  const [user, setUser] = useLocalStorage("user", null);
  const [logType, setLogType] = useState([]);

  const getLogs = () => {
    setLoading(true);
    getLogsApi(
      pagination.page,
      pagination.rowsPerPage,
      search,
      order,
      orderBy,
      logType
    )
      .then((res) => {
        setLogs(res.data);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getLogs();
  }, [pagination, search, order, orderBy, logType]);

  const renderNotification = (data) => {
    const parsedData = data.split("~");

    return parsedData.map((item, index) => {
      const parsedItem = isValidJson(item);

      if (!parsedItem.valid) {
        return (
          <div key={index} className="flex gap-2 items-center">
            <Typography variant="h7">
              {parsedItem.content.replace(user.email, "you")}
            </Typography>
          </div>
        );
      }

      return (
        <div key={index} className="flex gap-2 items-center w-full">
          <CustomInput
            multiline
            rowsMax={8}
            value={item}
            formfullwidth
            fullwidth
            InputProps={{
              readOnly: true,
            }}
          />
        </div>
      );
    });
  };

  const downloadCSV = (data) => {
    const headers = ["Date,Log,Name,Email"];

    const rows = logs.data.flatMap(
      (project) =>
        `${project.createdAt},${project.log.replace(/\n/g, " ").replace(/\\/g, "")},${project.createdBy.name},${project.createdBy.email}`
    );
    console.log(rows);

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
      <CustomTable
        title="Logs"
        data={logs.data}
        pagination={pagination}
        filters={filters}
        searchTerm={search}
        order={order}
        orderBy={orderBy}
        totalData={logs.totalCount}
        setOrder={setOrder}
        setOrderBy={setOrderBy}
        setPagination={setPagination}
        setFilters={setFilters}
        setSearchTerm={setSearchTerm}
        logType={logType}
        setLogType={setLogType}
        columns={[
          {
            id: "log",
            label: "Log",
            width: 900,
            cell: (row) => renderNotification(row.log),
          },
          { id: "createdAt", label: "Date", width: 200 },
          {
            id: "createdBy.email",
            label: "User",
            width: 250,
            filterValue: (row) =>
              `${row.createdBy.name} ${row.createdBy.email}`, // Use name & email for filtering
            cell: (row) => (
              <div className="flex gap-2 items-center">
                <Image
                  src={row.createdBy.profile}
                  alt="profile"
                  width={35}
                  height={35}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <Typography variant="h7" fontWeight={"bold"}>
                    {row.createdBy.name}
                  </Typography>
                  <Typography
                    variant="h7"
                    sx={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.createdBy.email}
                  </Typography>
                </div>
              </div>
            ),
          },
        ]}
        onRowClick={(row) => router.push(row?.link || "/dashboard")}
        isLoading={loading}
        refresh={getLogs}
        downloadCsv={downloadCSV}
      />
    </Box>
  );
};

export default Logs;
