import {
  Badge,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useEffect, useState } from "react";
import {
  getNotificationApi,
  readNotificationApi,
} from "@/utilities/api/notification";
import Image from "next/image";
import { catchError, getDate } from "@/utilities/helpers/functions";
import { showNotification } from "../../notification";

const Notification = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [notification, setNotification] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (unread) {
      readNotificationApi(notification[0].createdAt)
        .then((res) => {
          //   showNotification({
          //     content: res.data.message,
          //   });
          getNotification(false);
        })
        .catch((err) => {
          console.log(err);
          catchError(err);
        });
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    getNotification();
  }, []);

  const getNotification = (loading = true) => {
    loading && setLoading(true);
    getNotificationApi(limit)
      .then((res) => {
        setNotification(res.data.data);
        setUnread(res.data.totalUnread);
      })
      .catch((err) => {
        console.log(err);
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      {/* {loading ? (
        <CircularProgress size={24} />
      ) : (
      )} */}
      <IconButton onClick={handleClick}>
        <Badge badgeContent={unread} color="primary">
          <NotificationsIcon color="secondary" />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disablePortal
        transformOrigin={{ horizontal: "right", vertical: "left" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={(theme) => ({
          // backdropFilter: "blur(12px)",
          "& .MuiPaper-root": {
            backgroundColor: "background.defaultSolid",
            minHeight: "fit-content",
            maxHeight: "20rem",
            overflow: "auto",
            borderRadius: "0.5rem",
            boxShadow: "0 0 0.2rem" + theme.palette.text.primary,
            marginTop: 0.5,
            "& .MuiList-root": {
              padding: "0rem",
            },
            "& .MuiMenuItem-root": {
              width: "100%",
            },
          },
        })}
      >
        {notification?.length ? (
          notification.map((item, index) => (
            <>
              <Box
                className="flex gap-4 items-start flex-col p-4"
                sx={{
                  backgroundColor: "background.defaultSolid",
                  width: {
                    xs: "80vw",
                    md: "40vw",
                    lg: "35vw",
                    xl: "25vw",
                  },
                }}
              >
                <Typography
                  variant="h7"
                  sx={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitLineClamp: "vertical",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.log}
                </Typography>
                <div className="flex items-end justify-between w-full">
                  <div className="flex gap-2 items-center">
                    <Image
                      src={item.createdBy.profile}
                      alt="profile"
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    <div className="flex flex-col">
                      <Typography variant="h8">
                        {item.createdBy.name}
                      </Typography>
                      <Typography variant="h8">
                        {item.createdBy.email}
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="h8">
                    {getDate(item.createdAt)}
                  </Typography>
                </div>
              </Box>
              {notification?.length !== index + 1 && (
                <Divider className="w-full" />
              )}
            </>
            // </MenuItem>
          ))
        ) : (
          <MenuItem
            onClick={handleClose}
            className="flex gap-2 items-center py-3"
            sx={{
              "&:hover": {
                backgroundColor: "background.default",
              },
            }}
          >
            <div className="flex gap-2 items-center">
              <div className="flex gap-2 items-center">No notifications</div>
            </div>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default Notification;
