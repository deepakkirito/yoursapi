"use client";

import { useContext, useEffect, useState } from "react";
import { showNotification } from "../../../common/notification";
import Alert from "../../../common/popup/alert";
import { usePathname } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid2,
  IconButton,
  InputAdornment,
  TablePagination,
  Typography,
} from "@mui/material";
import AddProject from "@/components/pages/project/addProject";
import { CreatePopupContext } from "@/utilities/context/popup";
import {
  Add,
  KeyboardArrowRightRounded,
  RestoreRounded,
  SaveRounded,
} from "@mui/icons-material";
import SearchFilter from "../../../common/searchFilter";
import Image from "next/image";
import NotFound from "@/components/assets/svg/notFound.png";
import style from "./style.module.scss";
import Link from "next/link";
import TooltipCustom from "../../../common/tooltip";
import { catchError, getDate } from "@/utilities/helpers/functions";
import {
  checkProjectExistApi,
  restoreProjectApi,
  updateProjectNameApi,
  updateSharedProjectNameApi,
} from "@/utilities/api/projectApi";
import FolderSharedRoundedIcon from "@mui/icons-material/FolderSharedRounded";
import CreateProject from "@/components/assets/svg/createProject.svg";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import LocalPoliceRoundedIcon from "@mui/icons-material/LocalPoliceRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import DrawRoundedIcon from "@mui/icons-material/DrawRounded";
import CustomInput from "@/components/common/customTextField";
import { CreateAlertContext } from "@/utilities/context/alert";
import useCustomWindow from "@/utilities/helpers/hooks/window";
import AddProjectNew from "../addProjectNew";

const ProjectLayout = ({
  getApi,
  title,
  alertContent,
  deleteData,
  openshare = () => {},
}) => {
  const { popup, setPopup } = useContext(CreatePopupContext);
  const { alert, setAlert } = useContext(CreateAlertContext);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [totlaCount, setTotalCont] = useState(0);
  const [filter, setFilter] = useState("name");
  const [sort, setSort] = useState("lth");
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
  });
  const [deleteId, setDeleteId] = useState("");
  const location = usePathname();
  const [projectName, setProjectName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [showEdit, setShowEdit] = useState("");
  const window = useCustomWindow();

  useEffect(() => {
    !popup.open && getProject();
  }, [pagination, filter, search, sort, popup]);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    await deleteData
      .api(id)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProject();
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const handleRestore = async (id) => {
    setDeleteLoading(true);
    await restoreProjectApi(id)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProject();
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const getProject = async () => {
    setPageLoading(true);
    await getApi(pagination, search, filter, sort)
      .then((res) => {
        setProjects(res.data.data);
        setTotalCont(res.data.totalCount);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  const handleUpdateProjectName = async (id) => {
    setSaveLoading(true);
    await updateProjectNameApi(id, {
      projectName: projectName,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProject();
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setSaveLoading(false);
        setShowEdit(false);
        setProjectName("");
      });
  };

  const handleUpdateSharedProjectName = async (id, email) => {
    setSaveLoading(true);
    await updateSharedProjectNameApi(id, {
      projectName: projectName,
      email: email,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getProject();
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setSaveLoading(false);
        setShowEdit(false);
        setProjectName("");
      });
  };

  const renderMembers = (name, email, profile, index = 0, length = 1) => {
    return (
      <div key={index}>
        <div className="flex gap-2 items-center my-2">
          {profile && (
            <Image
              src={profile}
              alt="profile"
              width={30}
              height={30}
              className="rounded-full"
            />
          )}
          <div className="flex flex-col">
            <Typography variant="h8">
              <b>{name}</b>
            </Typography>
            {email !== "" && (
              <Typography variant="h8">
                <b>{email}</b>
              </Typography>
            )}
          </div>
        </div>
        {length - 1 !== index && <Divider />}
      </div>
    );
  };

  return (
    <Box
      className={style.ProjectLayout}
      sx={{
        border: "0.2rem solid",
        borderTop: "0.1rem solid",
        borderLeft: "0.1rem solid",
        borderColor: "divider",
        height: "inherit",
      }}
    >
      <Box
        className="flex items-center justify-between"
        sx={{
          backgroundColor: "background.foreground",
          borderBottom: "0.1rem solid",
          borderColor: "divider",
          padding: "0.5rem 1rem",
        }}
      >
        <Typography className="heading">{title}</Typography>
        {location === "/projects" && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              setAlert({
                open: true,
                title: "Create Project",
                content: <AddProjectNew handleSuccess={getProject} />,
                hideButton: true,
              })
            }
          >
            Add new project
          </Button>
        )}
      </Box>
      <Box
        className="py-2 px-2"
        sx={{
          borderRadius: "0 0 1rem 1rem",
          height: "inherit",
        }}
      >
        <Box>
          <SearchFilter
            label="Sort by"
            options={[
              { label: "Project Name", value: "name" },
              { label: "Created at", value: "createdAt" },
              { label: "Last updated", value: "updatedAt" },
            ]}
            value={filter}
            handleChange={(event) => setFilter(event.target.value)}
            getSort={(value) => setSort(value)}
            getSearch={(value) => {
              setTimeout(() => {
                setSearch(value);
              }, 200);
            }}
          />
        </Box>
        <Box height={"inherit"}>
          {pageLoading ? (
            <Box className="flex justify-center items-center h-[calc(100vh-16.2rem)]">
              <CircularProgress size={24} color="secondary" />
            </Box>
          ) : (
            <Grid2
              container
              spacing={2}
              className="items-start py-2 overflow-auto content-baseline h-inherit"
            >
              {!projects?.length ? (
                <Grid2 item size={{ xs: 12 }}>
                  <Box className="flex flex-col items-center justify-center py-8">
                    <Image
                      src={NotFound}
                      alt="no project"
                      width={0}
                      height={0}
                      style={{
                        width: "40%",
                        height: "auto",
                        paddingTop: "4rem",
                      }}
                    />
                    <Typography className="notFound">
                      No Projects found
                    </Typography>
                  </Box>
                </Grid2>
              ) : (
                projects.map((item, index) => (
                  <Grid2
                    item
                    size={{ xs: 12, md: 6, lg: 4, xl: 3 }}
                    key={item._id}
                    className={style.projectCard}
                  >
                    <Box
                      className="flex flex-col gap-2"
                      sx={(theme) => ({
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "0.5rem",
                        backgroundColor: "background.default",
                        padding: "1rem",
                        cursor: "pointer",
                        width: "100%",
                        boxShadow: "0 0 0.1rem " + theme.palette.border.default,
                        ":hover": {
                          backgroundColor: "background.defaultSolid",
                        },
                      })}
                    >
                      <Box className="flex justify-between items-center w-[100%]">
                        {(showEdit !== item._id || showEdit === "") && (
                          <Typography
                            variant="h5"
                            sx={{
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                            }}
                            onDoubleClick={() => {
                              if (location.includes("/shared")) {
                                if (item.permission?.editName) {
                                  setShowEdit(item._id);
                                  setProjectName(item.name);
                                }
                              } else if (location === "/projects") {
                                setShowEdit(item._id);
                                setProjectName(item.name);
                              }
                            }}
                          >
                            {item.name}
                          </Typography>
                        )}
                        {showEdit === item._id && (
                          <CustomInput
                            fullWidth
                            size="small"
                            value={projectName}
                            label="Project Name"
                            type="text"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            onChange={(event) => {
                              setProjectName(event.target.value);
                            }}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <TooltipCustom
                                      title="Save project name"
                                      placement="top"
                                    >
                                      <IconButton
                                        aria-label="save project name"
                                        edge="end"
                                        disabled={saveLoading}
                                        onClick={() => {
                                          projectName !== item.name
                                            ? location === "/projects"
                                              ? handleUpdateProjectName(
                                                  item._id
                                                )
                                              : handleUpdateSharedProjectName(
                                                  item._id,
                                                  item.owner.email
                                                )
                                            : setShowEdit("");
                                        }}
                                      >
                                        {saveLoading ? (
                                          <CircularProgress
                                            size={16}
                                            color="secondary"
                                          />
                                        ) : (
                                          <SaveRounded color="secondary" />
                                        )}
                                      </IconButton>
                                    </TooltipCustom>
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />
                        )}
                        {deleteLoading && item._id === deleteId ? (
                          <CircularProgress size={24} color="secondary" />
                        ) : (
                          <Box className="flex gap-0 items-center">
                            {(location === "/projects" ||
                              (location === "/projects/shared" &&
                                item.status !== "inactive")) && (
                              <Link
                                href={`${location}/${item._id}`}
                                onClick={() =>
                                  window.localStorage.setItem(
                                    "project_" + item._id,
                                    item.name
                                  )
                                }
                              >
                                <TooltipCustom
                                  title="Go to project"
                                  placement="top"
                                >
                                  <IconButton className={style.cardLink}>
                                    <KeyboardArrowRightRounded color="secondary" />
                                  </IconButton>
                                </TooltipCustom>
                              </Link>
                            )}
                            {/* RESTORE */}
                            {(location === "/projects/inactive" ||
                              (location === "/projects/shared" &&
                                item.status === "inactive" &&
                                item.permission?.restoreProject)) && (
                              <Box className="flex gap-4">
                                <TooltipCustom
                                  title="Activate Project"
                                  placement="top"
                                >
                                  <IconButton
                                    className={style.cardLink}
                                    onClick={() => {
                                      handleRestore(item._id);
                                      setDeleteId(item._id);
                                    }}
                                  >
                                    <RestoreRounded color="secondary" />
                                  </IconButton>
                                </TooltipCustom>
                              </Box>
                            )}
                            {/* SHARE */}
                            {(location === "/projects" ||
                              (location === "/projects/shared" &&
                                item.permission.share)) && (
                              <TooltipCustom
                                title="Share Project to other members"
                                placement="top"
                              >
                                <IconButton
                                  className={style.cardShare}
                                  onClick={() => openshare(item._id)}
                                >
                                  <FolderSharedRoundedIcon color="secondary" />
                                </IconButton>
                              </TooltipCustom>
                            )}
                            {/* DELETE */}
                            {item.status !== "inactive" &&
                              (location === "/projects" ||
                                location === "/projects/inactive" ||
                                item.permission?.inactiveProject) && (
                                <TooltipCustom
                                  title={deleteData.tooltip}
                                  placement="top"
                                >
                                  <IconButton
                                    className={style.cardDelete}
                                    onClick={() => {
                                      setDeleteId(item._id);
                                      setAlert({
                                        open: true,
                                        title: "Are you Sure?",
                                        content: alertContent,
                                        handleSuccess: () =>
                                          handleDelete(item._id),
                                        handleClose: () =>
                                          setAlert({
                                            open: false,
                                          }),
                                      });
                                    }}
                                  >
                                    {deleteData.icon}
                                  </IconButton>
                                </TooltipCustom>
                              )}
                          </Box>
                        )}
                      </Box>
                      <Divider />
                      <Box className="flex flex-col gap-[0.1rem]">
                        <Typography
                          variant="h7"
                          className="mb-2"
                          sx={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2, // Limits text to 2 lines
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal", // Allows wrapping
                            maxWidth: "100%",
                          }}
                        >
                          {item?.description}
                        </Typography>
                        <Box className="flex justify-between items-center mb-2">
                          <TooltipCustom
                            title={
                              <div className="min-h-auto max-h-[15rem] overflow-auto">
                                {item?.shared?.length
                                  ? item.shared?.map((data, index) =>
                                      renderMembers(
                                        data.name,
                                        data.email,
                                        data.profile,
                                        index,
                                        item.shared.length
                                      )
                                    )
                                  : "No one"}
                              </div>
                            }
                            placement="right"
                          >
                            <Box className="flex gap-2 items-center">
                              <Typography variant="h7">Shared with</Typography>
                              <Typography
                                variant="h7"
                                sx={{
                                  backgroundColor: "background.invert",
                                  padding: "0.1rem 0.6rem",
                                  borderRadius: "1rem",
                                }}
                              >
                                {item.shared?.length}
                              </Typography>
                              <GroupAddRoundedIcon color="secondary" />
                            </Box>
                          </TooltipCustom>
                          <TooltipCustom
                            title={
                              <div className="min-h-auto max-h-[15rem] overflow-auto">
                                {item.apiIds?.length
                                  ? item.apiIds?.map((data, index) => (
                                      <Typography key={index}>
                                        - {data}
                                      </Typography>
                                    ))
                                  : "No apis"}
                              </div>
                            }
                            placement="top"
                          >
                            <Box className="flex gap-2 items-center">
                              <Typography
                                variant="h7"
                                sx={{
                                  backgroundColor: "background.invert",
                                  padding: "0.1rem 0.6rem",
                                  borderRadius: "1rem",
                                }}
                              >
                                {item.apiIds?.length}
                              </Typography>
                              <Typography variant="h7">apis</Typography>
                            </Box>
                          </TooltipCustom>
                        </Box>
                        {location === "/projects/shared" && (
                          <Box className="flex justify-between items-center">
                            <TooltipCustom
                              title={"Permission"}
                              placement="bottom"
                            >
                              <Box className="flex gap-2 items-center">
                                <Typography
                                  variant="h7"
                                  sx={{
                                    transform: "translateY(0.1rem)",
                                    ":first-letter": {
                                      textTransform: "capitalize",
                                    },
                                  }}
                                >
                                  {item.permission?.name} level
                                </Typography>
                                {item.permission === "admin" && (
                                  <LocalPoliceRoundedIcon color="secondary" />
                                )}
                                {item.permission === "read" && (
                                  <AutoStoriesRoundedIcon color="secondary" />
                                )}
                                {item.permission === "write" && (
                                  <DrawRoundedIcon color="secondary" />
                                )}
                              </Box>
                            </TooltipCustom>
                            <TooltipCustom title={"Status"} placement="bottom">
                              <Typography
                                sx={{
                                  backgroundColor:
                                    item.status === "inactive"
                                      ? "status.red"
                                      : "status.green",
                                  padding: "0.1rem 0.6rem",
                                  borderRadius: "1rem",
                                  color: "white",
                                }}
                              >
                                {item.status}
                              </Typography>
                            </TooltipCustom>
                          </Box>
                        )}
                        <Box className="flex gap-2 flex-col mt-3">
                          <Box className="flex items-center justify-between">
                            <TooltipCustom title={"Created at"} placement="top">
                              <Box className="flex gap-2 items-center">
                                <CalendarMonthRoundedIcon
                                  fontSize="small"
                                  color="secondary"
                                />
                                <Typography
                                  variant="h7"
                                  sx={
                                    {
                                      // transform: "translateY(0.2rem)",
                                    }
                                  }
                                >
                                  {getDate(item.createdAt)}
                                </Typography>
                              </Box>
                            </TooltipCustom>
                            {location === "/projects/shared" && (
                              <TooltipCustom
                                title={renderMembers(
                                  item.owner?.name + " (owner)",
                                  item.owner?.email,
                                  null,
                                  index
                                )}
                                placement="top"
                              >
                                <Image
                                  src={item?.owner?.profile}
                                  alt="profile"
                                  width={30}
                                  height={30}
                                  style={{ borderRadius: "50%" }}
                                />
                              </TooltipCustom>
                            )}
                          </Box>
                          <Box className="flex items-center justify-between">
                            <TooltipCustom
                              title={"Last modified"}
                              placement="bottom"
                            >
                              <Box className="flex gap-2 items-center">
                                <EditCalendarRoundedIcon
                                  fontSize="small"
                                  color="secondary"
                                />
                                <Typography
                                  variant="h7"
                                  sx={
                                    {
                                      // transform: "translateY(0.2rem)",
                                    }
                                  }
                                >
                                  {getDate(item.updatedAt)}
                                </Typography>
                              </Box>
                            </TooltipCustom>
                            <TooltipCustom
                              title={renderMembers(
                                item?.updatedBy?.name + " (last modified)",
                                item?.updatedBy?.email,
                                null,
                                index
                              )}
                              placement="bottom"
                            >
                              <Image
                                src={item?.updatedBy?.profile}
                                alt="profile"
                                width={30}
                                height={30}
                                style={{ borderRadius: "50%" }}
                              />
                            </TooltipCustom>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid2>
                ))
              )}
            </Grid2>
          )}
        </Box>
        {projects?.length ? (
          <Grid2
            item
            xs={12}
            sx={{
              position: "sticky",
              bottom: "0.5rem",
              backgroundColor: "background.default",
              borderRadius: "0.5rem",
              border: "0.1rem solid",
              borderColor: "divider",
            }}
          >
            <TablePagination
              component="div"
              count={totlaCount}
              page={pagination.page}
              variant="outlined"
              color="loading"
              onPageChange={(event, newPage) =>
                setPagination({ ...pagination, page: newPage })
              }
              rowsPerPage={pagination.rowsPerPage}
              onRowsPerPageChange={(event) =>
                setPagination({
                  page: 0,
                  rowsPerPage: parseInt(event.target.value, 10),
                })
              }
            />
          </Grid2>
        ) : (
          ""
        )}
      </Box>
    </Box>
  );
};

export default ProjectLayout;
