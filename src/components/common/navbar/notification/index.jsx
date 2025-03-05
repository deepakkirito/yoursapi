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
import { useEffect, useRef, useState } from "react";
import {
  getNotificationApi,
  readNotificationApi,
} from "@/utilities/api/notification";
import Image from "next/image";
import {
  catchError,
  getDate,
  isValidJson,
} from "@/utilities/helpers/functions";
import { showNotification } from "../../notification";
import CustomInput from "../../customTextField";
import { CloseRounded } from "@mui/icons-material";
import Link from "next/link";

const Notification = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [notification, setNotification] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const customLimit = 30;
  const [limit, setLimit] = useState(customLimit);
  const containerRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);

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
    getNotificationApi(limit, notification?.length)
      .then((res) => {
        setNotification([...notification, ...res.data.data]);
        setUnread(res.data.totalUnread);
        setHasMore(res.data.hasMore);
        setLimit(limit + customLimit);
      })
      .catch((err) => {
        console.log(err);
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
      getNotification(); // Load more on reaching bottom
    }
  };

  const renderNotification = (data) => {
    const parsedData = data.split("~");

    return parsedData.map((item, index) => {
      const parsedItem = isValidJson(item);

      if (!parsedItem.valid) {
        return (
          <div key={index} className="flex gap-2 items-center">
            <Typography variant="h8" sx={{ fontWeight: "bold" }}>
              {parsedItem.content}
            </Typography>
          </div>
        );
      }

      return (
        <div key={index} className="flex gap-2 items-center w-full">
          <CustomInput
            multiline
            rowsMax={8}
            value={item}
            formfullwidth
            fullwidth
            InputProps={{
              readOnly: true,
            }}
          />
        </div>
      );
    });
  };

  return (
    <div className="flex items-center gap-2 cursor-pointer">
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
        <Box
          className="py-2 px-4 flex items-center justify-between"
          sx={{
            backgroundColor: "background.defaultSolid",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          <IconButton onClick={handleClose}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>
        <div
          ref={containerRef}
          onScroll={handleScroll} // Attach scroll event
          style={{
            minHeight: "100%",
            maxHeight: "70vh",
            overflow: "auto",
          }}
        >
          {notification?.length ? (
            notification.map((item, index) => (
              <>
                <Box
                  component={Link}
                  href={item.link || "/projects"}
                  className="flex gap-4 items-start flex-col p-4"
                  sx={{
                    backgroundColor: "background.defaultSolid",
                    color: "text.primary",
                    width: {
                      xs: "80vw",
                      md: "40vw",
                      lg: "35vw",
                      xl: "25vw",
                    },
                  }}
                >
                  {item.log.includes("~") ? (
                    <> {renderNotification(item.log)}</>
                  ) : (
                    <Typography variant="h8" fontWeight={"bold"}>
                      {item.log}
                    </Typography>
                  )}
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
            ))
          ) : (
            <div className="flex gap-2 items-center">
              {!loading && (
                <div className="flex gap-2 items-center">No notifications</div>
              )}
            </div>
          )}
          {loading && (
            <Box
              className="flex justify-center items-center h-[5rem]"
              sx={{
                backgroundColor: "background.defaultSolid",
              }}
            >
              <CircularProgress color="secondary" size={20} />
            </Box>
          )}
        </div>
      </Menu>
    </div>
  );
};

export default Notification;
