import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getSessionsApi } from "@/utilities/api/sessionsApi";
// import Map from "@/components/common/map";

const Sessions = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    getSessions();
  }, []);

  const getSessions = async () => {
    setLoading(true);
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

  return (
    <Box className="h-full">
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
        }}
      >
        <Typography variant="h4">Sessions</Typography>
      </Box>
      <Box className="w-full h-full">
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress color="secondary" size={24} />
          </Box>
        ) : (
          <Box className="flex flex-col gap-4h-full">
            {sessions?.length ? (
              sessions.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="h7">{item.location.city}</Typography>
                    <Typography variant="h7">
                      {item.location.country}
                    </Typography>
                    {/* <Map provider="leaflet" position={item.location} /> */}
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
