"use client";
import { Box, CircularProgress, Grid2 } from "@mui/material";
import DataContent from "./content";
import Navbar from "./navbar";
import ContentBar from "@/components/common/contentBar";
import { use, useEffect, useMemo, useRef, useState } from "react";
import Settings from "./settings";
import { getApiDetailsApi, updateApiDataApi } from "@/utilities/api/apiApi";
import { useRouter, useSearchParams } from "next/navigation";
import { catchError, getDataToString } from "@/utilities/helpers/functions";
import { showNotification } from "@/components/common/notification";
import Schema from "./schema";
import CustomData from "./customData";
import AI from "./ai";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";

const DataApi = ({ shared = false }) => {
  const project = useLocalStorage("project", "");
  const searchparams = useSearchParams();
  const [open, setOpen] = useLocalStorage(`${project}_open`, false);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const id = searchparams.get("id");
  const currentData = useRef("");
  const [apiData, setApiData] = useState({});
  const router = useRouter();

  useEffect(() => {
    id && getApiDetails(id);
  }, [id]);

  const getApiDetails = async (id) => {
    setLoading(true);
    await getApiDetailsApi(id)
      .then((response) => {
        setData(getDataToString(response.data.data));
        currentData.current = getDataToString(response.data.data);
        setApiData(response.data.apiData);
      })
      .catch((error) => {
        catchError(error);
        router.back();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const Items = useMemo(
    () => [
      {
        id: "schema",
        title: "Schema",
        content: (
          <Schema
            data={apiData.schema}
            apiId={id}
            refetch={() => getApiDetails(id)}
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
            refetch={() => getApiDetails(id)}
            setApiData={setApiData}
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
    <div>
      <Box
        sx={{
          borderRadius: "1rem",
          border: "0.5rem solid",
          borderColor: "background.default",
          boxShadow: "0 0 1rem background.default",
          outline: "2px solid",
          outlineColor: "background.inactive",
          height: "100%",
        }}
      >
        <Box
          sx={{
            backgroundColor: "background.foreground",
            borderBottom: "0.2rem solid",
            borderColor: "background.default",
            padding: "1rem",
            position: {
              lg: "sticky",
              xs: "relative",
            },
            top: "0",
            zIndex: "5",
            width: "100%",
            borderRadius: "0.5rem",
          }}
        >
          <Navbar shared={shared} />
        </Box>
        <Grid2
          container
          spacing={2}
          sx={{
            padding: "1rem",
            overflow: "auto",
            height: {
              lg: "calc(100vh - 13rem)",
              xs: "100%",
            },
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
                defaultExpanded={"schema"}
              />
            )}
          </Grid2>
        </Grid2>
      </Box>
    </div>
  );
};

export default DataApi;
