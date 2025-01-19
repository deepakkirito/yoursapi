"use client";
import { Box, CircularProgress, Grid2 } from "@mui/material";
import DataContent from "./content";
import Navbar from "./navbar";
import ContentBar from "@/components/common/contentBar";
import { useEffect, useMemo, useRef, useState } from "react";
import Settings from "./settings";
import { getApiDetailsApi, updateApiDataApi } from "@/utilities/api/apiApi";
import { useSearchParams } from "next/navigation";
import { catchError } from "@/utilities/helpers/functions";
import { showNotification } from "@/components/common/notification";
import Schema from "./schema";
import CustomData from "./customData";

const DataApi = () => {
  const searchparams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const id = searchparams.get("id");
  const currentData = useRef("");
  const [apiData, setApiData] = useState({});

  useEffect(() => {
    id && getApiDetails(id);
  }, [id]);

  const getApiDetails = async (id) => {
    setLoading(true);
    await getApiDetailsApi(id)
      .then((response) => {
        setData(
          JSON.stringify(response.data.data, null, 4)
            .replace(/"/g, '"') // Escape double quotes
            .replace(/\\n/g, "\n")
        );
        currentData.current = JSON.stringify(response.data.data, null, 4)
          .replace(/"/g, '"') // Escape double quotes
          .replace(/\\n/g, "\n");
        setApiData(response.data.apiData);
      })
      .catch((error) => {
        catchError(error);
        window.location.href = "/projects";
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
        content: <CustomData />,
      },
      {
        id: "ai",
        title: "Youpi AI",
        content:
          "Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
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
          border: "1rem solid",
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
            borderBottom: "1rem solid",
            borderColor: "background.default",
            padding: "1rem",
            position: {
              lg: "sticky",
              xs: "relative",
            },
            top: "0",
            zIndex: "5",
            width: "100%",
          }}
        >
          <Navbar />
        </Box>
        <Grid2
          container
          spacing={2}
          sx={{
            padding: "1rem",
            overflow: "auto",
            height: {
              lg: "calc(100vh - 15.7rem)",
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
