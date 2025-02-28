import { UserPermissionoptions } from "@/components/assets/constants/user";
import CustomMenu from "@/components/common/customMenu";
import CustomSelect from "@/components/common/customSelect";
import CustomInput from "@/components/common/customTextField";
import { showNotification } from "@/components/common/notification";
import {
  checkOtherUserApi,
  getSingleShareProjectAccessApi,
  revokeSharedProjectApi,
  shareProjectApi,
  updatePermissionApi,
} from "@/utilities/api/projectApi";
import { CreatePopupContext } from "@/utilities/context/popup";
import { catchError } from "@/utilities/helpers/functions";
import { VerifiedUserRounded } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Grid2,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";

const ShareProject = ({ id }) => {
  const { popup, setPopup } = useContext(CreatePopupContext);
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [buttonloading, setButtonLoading] = useState(false);
  const [checkeduser, setCheckedUser] = useState("");
  const [checkedUserData, setCheckedUserData] = useState({});
  const [userPermission, setUserPermission] = useState("read");
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);

  useEffect(() => {
    getProject(true);
  }, []);

  const getProject = async (load) => {
    setLoading(load);
    await getSingleShareProjectAccessApi(id)
      .then((res) => {
        setProject(res.data);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
        setCheckedUserData({});
        setUserPermission("read");
        setCheckedUser("");
        setRevokeLoading(false);
      });
  };

  const checkOtherUser = async (email) => {
    setButtonLoading(true);
    await checkOtherUserApi(id, email)
      .then((res) => {
        setCheckedUserData(res.data);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setButtonLoading(false);
      });
  };

  const handleShareProject = async () => {
    setButtonLoading(true);
    await shareProjectApi(id, {
      email: checkeduser,
      permission: userPermission,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProject(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setButtonLoading(false);
      });
  };

  const handleRevoke = async (email) => {
    setRevokeLoading(true);
    await revokeSharedProjectApi(id, {
      email: email,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProject(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setRevokeLoading(false);
      });
  };

  const handleChangePermission = async (email, permission) => {
    setPermissionLoading(true);
    await updatePermissionApi(id, {
      email: email,
      permission: permission,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        getProject(false);
        setPermissionLoading(false);
      });
  };

  return (
    <div className="h-[calc(100vh-15rem)] overflow-auto">
      {loading && (
        <div className="flex items-center justify-center h-[calc(100vh-15rem)]">
          <CircularProgress color="secondary" />
        </div>
      )}
      {!loading && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Project name:
            </Typography>
            <Typography variant="h6">{project.name}</Typography>
          </div>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formElements = event.currentTarget.elements;
              const email = formElements.email.value;
              if ("name" in checkedUserData) {
                handleShareProject();
              } else {
                checkOtherUser(email);
              }
            }}
            onChange={(event) => {
              const formElements = event.currentTarget.elements;
              const email = formElements.email.value;
              setCheckedUser(email);
              setCheckedUserData({});
            }}
          >
            <CustomInput
              required
              fullWidth
              formLabel="Share with"
              type="email"
              name="email"
              placeholder="Email"
              value={checkeduser}
              paddingLeft="1rem"
              slotProps={{
                input: {
                  endAdornment: project.sharedUsers?.length ? (
                    <CustomMenu
                      icon={<VerifiedUserRounded color="secondary" />}
                      tooltipTitle={"See previous shared users"}
                      options={project.sharedUsers}
                      getUser={(email) => setCheckedUser(email)}
                      menuPosition="right"
                    />
                  ) : (
                    ""
                  ),
                },
              }}
            />

            <Grid2 container spacing={2} className="items-center">
              {"name" in checkedUserData && (
                <Grid2
                  item
                  size={{ xs: 12, md: 6 }}
                  className="flex items-center gap-2 justify-left flex-wrap"
                >
                  <div>
                    <CustomSelect
                      label="User Permission"
                      options={UserPermissionoptions}
                      value={userPermission}
                      none={false}
                      handleChange={(event) =>
                        setUserPermission(event.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src={checkedUserData.profile}
                      alt="profile"
                      width={35}
                      height={35}
                      style={{ borderRadius: "50%" }}
                    />
                    <Typography width={"max-content"}>
                      {checkedUserData.name}
                    </Typography>
                  </div>
                </Grid2>
              )}
              <Grid2
                item
                size={{ xs: 12, md: "name" in checkedUserData ? 6 : 12 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  endIcon={
                    buttonloading && (
                      <CircularProgress size={16} color="loading" />
                    )
                  }
                  sx={{
                    transition: "all 500ms",
                  }}
                >
                  {"name" in checkedUserData ? "Share" : "Check"}
                </Button>
              </Grid2>
            </Grid2>
          </form>
        </div>
      )}

      {project?.shared?.length ? (
        <>
          <div className="flex gap-2 mb-4 mt-12 flex-col">
            <div className="flex gap-2 items-center">
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Shared with
              </Typography>
              {(revokeLoading || permissionLoading) && (
                <CircularProgress size={24} color="secondary" />
              )}
            </div>
            <div>
              {project.shared?.map((data, index) => (
                <div key={index}>
                  <div className="flex gap-2 items-center my-2 flex-wrap">
                    <Image
                      src={data.profile}
                      alt="profile"
                      width={40}
                      height={40}
                      style={{ borderRadius: "50%" }}
                    />
                    <div className="w-[20rem]">
                      <Typography width={"max-content"}>{data.name}</Typography>
                      <Typography variant="h7">{data.email}</Typography>
                    </div>
                    {!data.self && <div>
                      <CustomSelect
                        options={UserPermissionoptions}
                        value={data.permission}
                        none={false}
                        disabled={data.self}
                        handleChange={(event) =>
                          handleChangePermission(data.email, event.target.value)
                        }
                      />
                    </div>}
                    {!data.self && <div>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={data.self || revokeLoading}
                        // endIcon={
                        //   revokeLoading && (
                        //     <CircularProgress size={16} color="loading" />
                        //   )
                        // }
                        onClick={() => handleRevoke(data.email)}
                      >
                        Revoke Access
                      </Button>
                    </div>}
                  </div>
                  <Divider />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default ShareProject;
