"use client";
import { Box, CircularProgress, Grid2 } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { catchError, getDataToString } from "@/utilities/helpers/functions";
import { getAuthApi, updateAuthApi } from "@/utilities/api/authApiApi";
import Create from "./create";
import Navbar from "../navbar";
import DataContent from "../dataContent";
import ContentBar from "@/components/common/contentBar";
import Schema from "../schema";
import { showNotification } from "@/components/common/notification";

const AuthApi = ({ shared = false }) => {
  const [loading, setLoading] = useState(true);
  const location = usePathname();
  const locationParts = location?.split("/") || [];
  const projectId = useRef(locationParts[shared ? 3 : 2] || null);
  const [authData, setAuthData] = useState({});
  const [data, setData] = useState("[]");
  const currentData = useRef("");
  const [open, setOpen] = useState(false);
  const Items = useMemo(
    () => [
      {
        id: "schema",
        title: "Schema",
        content: (
          <Schema
            data={authData.schema}
            apiId={authData._id}
            refetch={() => getAuthApiData(projectId.current)}
          />
        ),
      },
      {
        id: "settings",
        title: "Settings",
        content: "settings",
      },
    ],
    [authData]
  );

  useEffect(() => {
    getAuthApiData(projectId.current);
  }, []);

  const getAuthApiData = (id) => {
    setLoading(true);
    getAuthApi(id)
      .then((res) => {
        setLoading(false);
        currentData.current = getDataToString(res.data.data);
        setData(getDataToString(res.data.data));
        setAuthData(res.data.authData);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateApi = async () => {
    setLoading(true);
    if (data !== "[]") {
      try {
        JSON.parse(data);
      } catch (error) {
        setLoading(false);
        showNotification({
          content: "Data is not in valid format",
          type: "error",
        });
        return;
      }
    }

    const body = {
      data: data,
    };
    await updateAuthApi(authData._id, body)
      .then((response) => {
        showNotification({
          content: response.data.message,
          type: "success",
        });
        getAuthApiData(projectId.current);
      })
      .catch((error) => {
        catchError(error);
        setLoading(false);
        getAuthApiData(projectId.current);
      });
  };

  return (
    <Box
      sx={{
        borderRadius: "1rem",
        border: "0.2rem solid",
        borderColor: "background.default",
        boxShadow: "0 0 1rem background.default",
        height: "calc(100vh - 7rem)",
        backgroundColor: "background.foreground",
      }}
    >
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <CircularProgress color="secondary" size={24} />
        </div>
      ) : (
        <Box className="flex flex-col gap-4 items-center justify-center h-full overflow-auto">
          {authData?.name === "" ? (
            <Create projectId={projectId.current} refetch={getAuthApiData} />
          ) : (
            <Box className="w-full h-full">
              <Navbar shared={shared} endpoint="auth" query={false} />
              <Grid2
                container
                spacing={2}
                sx={{
                  padding: "1rem",
                  overflow: "auto",
                  height: {
                    lg: "calc(100vh - 12.3rem)",
                    xs: "100%",
                  },
                  borderRadius: "0 0 0.5rem 0.5rem",
                }}
              >
                <Grid2
                  item
                  size={{ xs: 12, lg: open ? 6 : 11, xl: open ? 6 : 11.2 }}
                  sx={{ transition: "all 0.5s" }}
                >
                  <DataContent
                    data={data}
                    setData={setData}
                    currentData={currentData}
                    setLoading={setLoading}
                    handleUpdateApi={handleUpdateApi}
                  />
                </Grid2>
                <Grid2
                  item
                  size={{ xs: 12, lg: open ? 6 : 1, xl: open ? 6 : 0.8 }}
                  sx={{ transition: "all 0.5s" }}
                >
                  <ContentBar
                    setOpen={setOpen}
                    open={open}
                    items={Items}
                    defaultExpanded={"schema"}
                  />
                </Grid2>
              </Grid2>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AuthApi;
