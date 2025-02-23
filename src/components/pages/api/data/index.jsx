"use client";
import { Box, CircularProgress, Grid2, Typography } from "@mui/material";
import DataContent from "../dataContent";
import ContentBar from "@/components/common/contentBar";
import { useEffect, useMemo, useRef, useState } from "react";
import Settings from "./settings";
import { getApiDetailsApi, updateApiDataApi } from "@/utilities/api/apiApi";
import { useRouter, useSearchParams } from "next/navigation";
import { catchError, getDataToString } from "@/utilities/helpers/functions";
import { showNotification } from "@/components/common/notification";
import CustomData from "./customData";
import AI from "./ai";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import Navbar from "../navbar";
import Schema from "../schema";
import Details from "../details";
import Lottie from "react-lottie";
import CreateApi from "@/components/assets/json/createApi.json";

const DataApi = ({ shared = false }) => {
  const project = useLocalStorage("project", "");
  const searchparams = useSearchParams();
  const [open, setOpen] = useLocalStorage(`${project}_open`, false);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const id = searchparams.get("id");
  const currentData = useRef("");
  const [apiData, setApiData] = useState({});
  const router = useRouter();
  const [permission, setPermission] = useState("read");
  const [openApi, setOpenApi] = useLocalStorage("openApi", false);

  useEffect(() => {
    id && getApiDetails(id);
  }, [id]);

  const getApiDetails = async (id, loading = true) => {
    loading && setLoading(true);
    await getApiDetailsApi(id)
      .then((response) => {
        setData(getDataToString(response.data.data));
        currentData.current = getDataToString(response.data.data);
        setApiData(response.data.apiData);
        setPermission(response.data.permission);
      })
      .catch((error) => {
        // catchError(error);
        router.back();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const Items = useMemo(
    () => [
      {
        id: "details",
        title: "Details",
        content: <Details data={apiData} />,
      },
      {
        id: "schema",
        title: "Schema",
        content: (
          <Schema
            data={apiData.schema}
            apiId={id}
            refetch={(loading) => getApiDetails(id, loading)}
            shared={shared}
            permission={permission}
          />
        ),
      },
      {
        id: "custom",
        title: "Custom Data",
        content: (
          <CustomData
            schema={apiData.schema}
            refetch={() => getApiDetails(id)}
            shared={shared}
            permission={permission}
          />
        ),
      },
      {
        id: "ai",
        title: "Youpi AI",
        content: <AI schema={apiData.schema} id={id} />,
      },
      {
        id: "settings",
        title: "Settings",
        content: (
          <Settings
            apiData={apiData}
            id={id}
            refetch={(loading) => getApiDetails(id, loading)}
            setApiData={setApiData}
            shared={shared}
            permission={permission}
          />
        ),
      },
    ],
    [apiData, id]
  );

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
    await updateApiDataApi(id, body)
      .then((response) => {
        showNotification({
          content: response.data.message,
          type: "success",
        });
        getApiDetails(id);
      })
      .catch((error) => {
        catchError(error);
        setLoading(false);
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
        overflow: "auto",
      }}
    >
      <Navbar
        title="Data Api"
        shared={shared}
        endpoint="data"
        query={true}
        refetch={() => getApiDetails(id, false)}
        openApi={openApi}
        setOpenApi={setOpenApi}
      />
      {!id ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12.3rem)] gap-4">
          {loading ? (
            <CircularProgress color="secondary" size={24} />
          ) : (
            <>
              {/* <Typography variant="h4" sx={{
                  transform: "translateY(100%)"
                }}>
                  Create your first api to get started
                </Typography> */}
              <Lottie
                options={{
                  animationData: CreateApi,
                  loop: true,
                  autoPlay: true,
                }}
                height={"100%"}
                width={"100%"}
              />
            </>
          )}
        </div>
      ) : (
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
            marginBottom: {
              xs: "5rem",
              lg: "0rem",
            },
            borderRadius: "0 0 0.5rem 0.5rem",
          }}
        >
          <Grid2
            item
            size={{ xs: 12, lg: open ? 6 : 11, xl: open ? 6 : 11.2 }}
            sx={{ transition: "all 0.5s" }}
          >
            {loading ? (
              <Box className="flex justify-center items-center h-full">
                <CircularProgress color="secondary" size={24} />
              </Box>
            ) : (
              <DataContent
                data={data}
                setData={setData}
                currentData={currentData}
                setLoading={setLoading}
                handleUpdateApi={handleUpdateApi}
                shared={shared}
                permission={permission}
              />
            )}
          </Grid2>
          <Grid2
            item
            size={{ xs: 12, lg: open ? 6 : 1, xl: open ? 6 : 0.8 }}
            sx={{ transition: "all 0.5s" }}
          >
            {loading ? (
              <Box className="flex justify-center items-center h-full">
                <CircularProgress color="secondary" size={24} />
              </Box>
            ) : (
              <ContentBar
                setOpen={setOpen}
                open={open}
                items={Items}
                defaultExpanded={"details"}
                // hideItems={
                //   shared && permission === "read" ? ["schema", "settings"] : []
                // }
              />
            )}
          </Grid2>
        </Grid2>
      )}
    </Box>
  );
};

export default DataApi;
