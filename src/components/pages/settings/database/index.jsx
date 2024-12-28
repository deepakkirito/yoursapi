"use client";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import style from "./style.module.scss";
import {
  getDatabaseInfoApi,
  saveDBStringApi,
} from "@/utilities/api/databaseApi";
import { useEffect, useState } from "react";
import SaveDatabase from "./save";
import DatabaseDetails from "./details";
import { catchError } from "@/utilities/helpers/functions";
import { showNotification } from "@/components/common/notification";
import { decrypt } from "@/utilities/helpers/encryption";

const DataBase = () => {
  const [{ dbString, saveInternal, saveExternal, apiDatabase }, setData] =
    useState({
      dbString: "",
      saveInternal: false,
      saveExternal: false,
      apiDatabase: "",
    });
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    getDatabaseInfo({ load: true });
  }, []);
  
  const getDatabaseInfo = async ({ load }) => {
    setLoading(load);
    await getDatabaseInfoApi()
      .then((res) => {
        setData({
          dbString: res.data.mongoDbKey ? decrypt(res.data.mongoDbKey) : "",
          saveInternal: res.data.saveInternal,
          saveExternal: res.data.saveExternal,
          apiDatabase: res.data.fetchData,
        });
      })
      .catch((err) => {
        console.log(err);
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDisconnect = async () => {
    setButtonLoading(true);
    const body = {
      dbString: "",
      saveInternal: true,
      saveExternal: false,
    };
    await saveDBStringApi(body)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        getDatabaseInfo({ load: true });
        setButtonLoading(false);
      });
  };

  return (
    <div>
      <Box
        className={style.DataBase}
        sx={{
          borderRadius: "1rem",
          border: "1rem solid",
          borderColor: "background.default",
          boxShadow: "0 0 1rem background.default",
          outline: "2px solid",
          outlineColor: "background.inactive",
        }}
      >
        <Box
          className="flex items-center justify-between"
          sx={{
            backgroundColor: "background.foreground",
            borderBottom: "1rem solid",
            borderColor: "background.default",
            padding: "1rem",
            position: "sticky",
            top: "0",
            zIndex: "5",
          }}
        >
          <Typography className="heading">Database Settings</Typography>
          {dbString && (
            <Button
              variant="contained"
              onClick={handleDisconnect}
              disabled={buttonLoading}
              endIcon={
                buttonLoading && (
                  <CircularProgress color="loading" size={24} />
                )
              }
              sx={{
                backgroundColor: "status.red",
                color: "common.button",
              }}
            >
              Disconnect Database
            </Button>
          )}
        </Box>
        <Box
          className="p-4"
          sx={{
            backgroundColor: "background.foreground",
          }}
        >
          <Box className="min-h-[calc(100vh-17rem)] max-h-[calc(100vh-17rem)] overflow-y-auto">
            {loading ? (
              <Box className="flex justify-center items-center transform translate-y-[15rem]">
                <CircularProgress color="secondary" size={24} />
              </Box>
            ) : (
              <Box>
                {(!dbString || dbString === "") && (
                  <SaveDatabase
                    fetchData={() => getDatabaseInfo({ load: false })}
                  />
                )}
                {/* {dbString && (
                  <DatabaseDetails
                    dbString={dbString}
                    saveInternal={saveInternal}
                    saveExternal={saveExternal}
                    apiDatabase={apiDatabase}
                    fetchData={(value) => getDatabaseInfo({ load: value })}
                  />
                )} */}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default DataBase;
