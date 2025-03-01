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
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import Settings from "./settings";
import Details from "../details";
import Lottie from "react-lottie";
import CreateApi from "@/components/assets/json/createApi.json";

const AuthApi = ({ shared = false }) => {
  const [loading, setLoading] = useState(true);
  const location = usePathname();
  const locationParts = location?.split("/") || [];
  const projectId = useRef(locationParts[shared ? 3 : 2] || null);
  const [authData, setAuthData] = useState({});
  const [data, setData] = useState("[]");
  const currentData = useRef("");
  const project = useLocalStorage("project", "");
  const [open, setOpen] = useLocalStorage(`${project}_open`, false);
  const [permission, setPermission] = useState("read");
  const [openApi, setOpenApi] = useLocalStorage("openApi", false);
  const Items = useMemo(
    () => [
      {
        id: "details",
        title: "Details",
        content: <Details data={authData} />,
      },
      {
        id: "schema",
        title: "Schema",
        content: (
          <Schema
            auth={true}
            data={authData.schema}
            apiId={authData._id}
            excludeKeyValues={{
              email: ["type", "required"],
              password: ["type", "required"],
            }}
            refetch={(loading) => getAuthApiData(projectId.current, loading)}
            shared={shared}
            permission={permission}
          />
        ),
      },
      {
        id: "settings",
        title: "Settings",
        content: (
          <Settings data={authData} shared={shared} permission={permission} />
        ),
      },
    ],
    [authData, permission]
  );

  useEffect(() => {    
    getAuthApiData(projectId.current);
  }, []);

  const getAuthApiData = (id, loading = true) => {
    console.log(id);
    loading && setLoading(true);
    getAuthApi(id)
      .then((res) => {
        setLoading(false);
        if (res.data?.data?.length) {
          currentData.current = getDataToString(res.data.data);
          setData(getDataToString(res.data.data));
        }
        setAuthData(res.data.authData || res.data);
        setPermission(res.data.permission);
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
          {/* <CircularProgress color="secondary" size={24} /> */}
          <Lottie
            options={{
              animationData: CreateApi,
              loop: true,
              autoPlay: true,
            }}
            height={"100%"}
            width={"100%"}
          />
        </div>
      ) : (
        <Box className="flex flex-col gap-4 items-center justify-center h-full overflow-auto">
          {"name" in authData && authData.name === "" ? (
            <Create
              projectId={projectId.current}
              refetch={getAuthApiData}
              shared={shared}
              permission={permission}
            />
          ) : (
            <Box className="w-full h-full">
              <Navbar
                title="Auth Api"
                shared={shared}
                endpoint="auth"
                query={false}
                auth={{
                  name: authData?.name,
                  id: authData?._id,
                }}
                refetch={(loading) =>
                  getAuthApiData(projectId.current, loading)
                }
                openApi={openApi}
                setOpenApi={setOpenApi}
              />
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
                    shared={shared}
                    permission={permission}
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
                    defaultExpanded={"details"}
                    // hideItems={
                    //   shared && permission === "read"
                    //     ? ["schema", "settings"]
                    //     : []
                    // }
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
