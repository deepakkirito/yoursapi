"use client";

import { youpiApiPermission } from "@/components/assets/constants/permission";
import CustomSelect from "@/components/common/customSelect";
import CustomInput from "@/components/common/customTextField";
import { showNotification } from "@/components/common/notification";
import {
  createPermissionApi,
  getPermissionApi,
  updatePermissionApi,
} from "@/utilities/api/permissionApi";
import { CreateAlertContext } from "@/utilities/context/alert";
import { CreatePopupContext } from "@/utilities/context/popup";
import { catchError } from "@/utilities/helpers/functions";
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Grid2,
  Switch,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";

const ShareProjectPermission = ({ id }) => {
  const [permission, setPermission] = useState("");
  const [switches, setSwitches] = useState({});
  const { setAlert } = useContext(CreateAlertContext);
  const { popup, setPopup } = useContext(CreatePopupContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [updateLoading, setUpdateLoading] = useState({});
  const [userPermission, setUserPermission] = useState(null);

  useEffect(() => {
    getPermission();
  }, [id]);

  useEffect(() => {
    if (!data.length) return;
    setPermission(permission || data[0]._id || "");
  }, [data]);

  useEffect(() => {
    permission && setSwitches(data.find((item) => item._id === permission));
  }, [permission]);

  const getPermission = async () => {
    setLoading(true);
    await getPermissionApi(id)
      .then((res) => {
        setData(res.data.data);
        setUserPermission(res.data.permission);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdatePermission = async (key, value) => {
    setUpdateLoading({
      [key]: true,
    });
    await updatePermissionApi(id, {
      permission: {
        [key]: value,
      },
      permissionId: permission,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getPermission();
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setUpdateLoading({});
      });
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-[calc(100vh-15rem)]">
          <CircularProgress color="primary" />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-4">
            <Typography variant="h6" width={"16rem"}>
              Permission Details
            </Typography>
            <CustomSelect
              label="User Permission"
              options={
                data?.length > 0
                  ? data.map((item) => ({
                      label: item.name,
                      value: item._id,
                    }))
                  : []
              }
              value={permission ?? ""}
              none={false}
              handleChange={(event) => setPermission(event.target.value)}
              fullWidth={false}
            />
            <Button
              variant="contained"
              disabled={
                !userPermission
                  ? false
                  : !userPermission?.createPermission
              }
              onClick={() => {
                setAlert({
                  open: true,
                  title: "Create Permission",
                  content: <PermissionForm id={id} />,
                  hideButton: true,
                });
                setPopup({
                  ...popup,
                  open: false,
                });
              }}
            >
              Create
            </Button>
          </div>
          <br />
          {data?.length > 0 && (
            <Grid2
              container
              spacing={2}
              className="items-center max-h-[30rem] overflow-auto"
            >
              {youpiApiPermission.map((item, index) => (
                <Grid2 size={{ xs: 12, sm: 6 }} key={index}>
                  {updateLoading[item?.value] ? (
                    <CircularProgress size={16} color="primary" />
                  ) : (
                    <FormControlLabel
                      sx={{
                        "& .MuiFormControlLabel-label": { width: "10rem" },
                      }}
                      label={item?.label}
                      control={
                        <Switch
                          color="primary"
                          disabled={
                            switches?.common || !userPermission
                              ? false
                              : !userPermission?.updatePermission
                          }
                          checked={switches[item?.value] ?? false}
                          onChange={(event) =>
                            handleUpdatePermission(
                              item?.value,
                              event.target.checked,
                              false
                            )
                          }
                        />
                      }
                      labelPlacement="start"
                    />
                  )}
                </Grid2>
              ))}
            </Grid2>
          )}
        </div>
      )}
    </div>
  );
};

export default ShareProjectPermission;

const PermissionForm = ({ id }) => {
  const [permissionName, setPermissionName] = useState("");
  const [switches, setSwitches] = useState({});
  const { setAlert } = useContext(CreateAlertContext);
  const { popup, setPopup } = useContext(CreatePopupContext);
  const [loading, setLoading] = useState(false);

  const handleCreatePermission = async () => {
    setLoading(true);
    await createPermissionApi(id, {
      name: permissionName,
      permission: switches,
    })
      .then((res) => {
        setLoading(false);
        showNotification({
          content: res.data.message,
        });
        setAlert({
          open: false,
        });
        setPopup({
          ...popup,
          open: true,
        });
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <CustomInput
        fullWidth
        type="text"
        label="Name"
        placeholder="Enter Permission Name"
        value={permissionName}
        onChange={(event) => setPermissionName(event.target.value)}
      />
      <div className="flex gap-4 items-center flex-wrap p-2">
        {youpiApiPermission.map((item, index) => (
          <FormControlLabel
            key={index}
            sx={{ "& .MuiFormControlLabel-label": { width: "10rem" } }}
            labelPlacement="start"
            label={item.label}
            control={
              <Switch
                color="primary"
                checked={switches[item.value]}
                onChange={(event) =>
                  setSwitches({
                    ...switches,
                    [item.value]: event.target.checked,
                  })
                }
              />
            }
          />
        ))}
      </div>
      <div className="flex justify-around gap-2 mt-4">
        <Button
          variant="contained"
          color="success"
          sx={{
            padding: "0.5rem 1.5rem",
            borderRadius: "2rem",
          }}
          disabled={loading || !permissionName}
          endIcon={loading && <CircularProgress size={16} color="primary" />}
          onClick={handleCreatePermission}
        >
          Save
        </Button>
        <Button
          variant="contained"
          color="error"
          sx={{
            padding: "0.5rem 1.5rem",
            borderRadius: "2rem",
          }}
          onClick={() => {
            setAlert({
              open: false,
            });
            setPopup({
              ...popup,
              open: true,
            });
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
