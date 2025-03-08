import { getLogsApi } from "@/utilities/api/logsApi";
import { getNotificationApi } from "@/utilities/api/notification";
import { catchError } from "@/utilities/helpers/functions";
import { Avatar, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CustomTable from "../../customTable";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const getLogs = () => {
    getLogsApi(page, rowsPerPage)
      .then((res) => {
        setLogs(res.data.data);
      })
      .catch((err) => {
        catchError(err);
      });
  };

  useEffect(() => {
    getLogs();
  }, []);

  return (
    <Box>
      <CustomTable
        title="Logs"
        data={logs}
        columns={[
          { id: "log", label: "Log", width: 400 },
          { id: "createdAt", label: "Date", width: 200 },
          {
            id: "createdBy",
            label: "User",
            width: 200,
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
                  <Typography variant="h7">{row.createdBy.email}</Typography>
                </div>
              </div>
            ),
          },
        ]}
        onRowClick={(row) => router.push(row.link)}
        isLoading={loading}
      />
    </Box>
  );
};

export default Logs;
