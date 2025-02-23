import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { deleteSessionApi, getSessionsApi } from "@/utilities/api/sessionsApi";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/common/map"), {
  ssr: false,
});
import { DeleteRounded } from "@mui/icons-material";
import { catchError, getDate } from "@/utilities/helpers/functions";
import { showNotification } from "@/components/common/notification";

const Sessions = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getSessions();
  }, []);

  const getSessions = async (loading = true) => {
    loading && setLoading(true);
    await getSessionsApi()
      .then((res) => {
        setSessions(res.data);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    setDeleteLoading({ [id]: true });
    await deleteSessionApi(id)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getSessions(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setDeleteLoading({ [id]: false });
      });
  };

  return (
    <Box>
      <Box
        sx={{
          borderRadius: "1rem",
          borderBottom: "0.2rem solid",
          borderColor: "background.default",
          backgroundColor: "background.foreground",
          overflow: "auto",
          paddingBottom: "1rem",
          borderRadius: "0.5rem 0.5rem 0 0",
          padding: "1rem",
          position: "sticky",
          top: "0",
        }}
      >
        <Typography variant="h4">Sessions</Typography>
      </Box>
      <Box className="w-full p-8 overflow-auto h-[calc(100vh-14rem)]">
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress color="secondary" size={24} />
          </Box>
        ) : (
          <Box className="flex flex-col gap-4">
            {sessions?.length ? (
              sessions.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-4 flex-wrap">
                    <div className="flex gap-4">
                      <div className="flex gap-2 flex-col items-center">
                        <Typography
                          variant="h7"
                          sx={{
                            backgroundColor: "background.defaultSolid",
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {index + 1}
                        </Typography>
                        {deleteLoading[item._id] ? (
                          <CircularProgress color="secondary" size={24} />
                        ) : (
                          <IconButton
                            onClick={() => handleDelete(item._id)}
                            disabled={deleteLoading}
                          >
                            <DeleteRounded color="error" />
                          </IconButton>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Typography variant="h7">
                          <b>Browser: </b> {item?.location?.browser}
                        </Typography>
                        <Typography variant="h7">
                          <b>OS: </b> {item?.location?.os}
                        </Typography>
                        <Typography variant="h7">
                          <b>City: </b> {item?.location?.city}
                        </Typography>
                        <Typography variant="h7">
                          <b>Region: </b> {item?.location?.region}
                        </Typography>
                        <Typography variant="h7">
                          <b>Country: </b> {item?.location?.country}
                        </Typography>
                        <Typography variant="h7">
                          <b>Created at: </b> {getDate(item?.createdAt)}
                        </Typography>
                        <Typography variant="h7">
                          <b>Last active: </b> {getDate(item?.lastActive)}
                        </Typography>
                      </div>
                      {item.current && (
                        <Typography
                          variant="h8"
                          sx={{
                            backgroundColor: "background.default",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "0.2rem",
                            border: "1px solid",
                            borderColor: "background.defaultSolid",
                            height: "fit-content",
                          }}
                        >
                          Current
                        </Typography>
                      )}
                    </div>
                    <Box className="flex items-center gap-2 overflow-hidden rounded-lg">
                      <Map
                        position={item?.location}
                        width="300px"
                        height="200px"
                      />
                    </Box>
                  </div>
                  <Divider />
                </div>
              ))
            ) : (
              <Typography variant="h7">No sessions found</Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Sessions;
