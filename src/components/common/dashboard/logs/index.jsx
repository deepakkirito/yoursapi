import { getLogsApi } from "@/utilities/api/logsApi";
import { getNotificationApi } from "@/utilities/api/notification";
import { catchError, isValidJson } from "@/utilities/helpers/functions";
import { Avatar, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CustomTable from "../../customTable";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CustomInput from "../../customTextField";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const getLogs = () => {
    setLoading(true);
    getLogsApi(page, rowsPerPage)
      .then((res) => {
        setLogs(res.data.data);
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
  }, []);

  const renderNotification = (data) => {
    const parsedData = data.split("~");

    return parsedData.map((item, index) => {
      const parsedItem = isValidJson(item);

      if (!parsedItem.valid) {
        return (
          <div key={index} className="flex gap-2 items-center">
            <Typography variant="h7">{parsedItem.content}</Typography>
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

  return (
    <Box>
      <CustomTable
        title="Logs"
        data={logs}
        columns={[
          {
            id: "log",
            label: "Log",
            width: 400,
            cell: (row) => renderNotification(row.log),
          },
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
