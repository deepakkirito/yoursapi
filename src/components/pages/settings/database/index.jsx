"use client";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import style from "./style.module.scss";
import {
  getDatabaseInfoApi,
  saveDBStringApi,
} from "@/utilities/api/databaseApi";
import { useContext, useEffect, useState } from "react";
import SaveDatabase from "./save";
import DatabaseDetails from "./details";
import { catchError } from "@/utilities/helpers/functions";
import { showNotification } from "@/components/common/notification";
import { decrypt } from "@/utilities/helpers/encryption";
import { CreateAlertContext } from "@/utilities/context/alert";

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
  const { alert, setAlert } = useContext(CreateAlertContext);

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
    <div className="px-2">
      <Box
        className={style.DataBase}
        sx={{
          borderRadius: "1rem",
          border: "0.2rem solid",
          borderColor: "background.default",
          boxShadow: "0 0 1rem background.default",
        }}
      >
        <Box
          className="flex items-center justify-between"
          sx={{
            backgroundColor: "background.foreground",
            borderBottom: "0.2rem solid",
            borderColor: "background.default",
            padding: "0.5rem 1rem",
            position: "sticky",
            top: "0",
            zIndex: "5",
            borderRadius: "1rem 1rem 0 0",
          }}
        >
          <Typography className="heading">Database Settings</Typography>
          {dbString && (
            <Button
              variant="contained"
              onClick={() => {
                setAlert({
                  open: true,
                  title: "Are you Sure?",
                  content: "Data will stop saving to your database",
                  handleSuccess: () => handleDisconnect(),
                  handleClose: () =>
                    setAlert({
                      open: false,
                    }),
                });
              }}
              disabled={buttonLoading}
              endIcon={
                buttonLoading && <CircularProgress color="loading" size={24} />
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
            borderRadius: "0 0 1rem 1rem",
          }}
        >
          <Box className="min-h-[calc(100vh-13.7rem)] max-h-[calc(100vh-13.7rem)] overflow-y-auto">
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
                {console.log(dbString)}

                {dbString && (
                  <DatabaseDetails
                    dbString={dbString}
                    saveInternal={saveInternal}
                    saveExternal={saveExternal}
                    apiDatabase={apiDatabase}
                    fetchData={(value) => getDatabaseInfo({ load: value })}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default DataBase;
