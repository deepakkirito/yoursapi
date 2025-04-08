import { forwardRef, useContext, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { CreatePopupContext } from "@/utilities/context/popup";
const {
  Box,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
  Grid2,
} = require("@mui/material");
import style from "./style.module.scss";
import DarkBackground from "@/components/assets/other/darkBackground.jpg";
import LightBackground from "@/components/assets/other/lightBackground.avif";
import CreateImage from "@/components/assets/svg/createProject.svg";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide ref={ref} {...props} />;
});

const FullScreenPopup = () => {
  const { popup, setPopup } = useContext(CreatePopupContext);

  return (
    <Dialog
      fullScreen
      open={popup.open}
      onClose={() =>
        setPopup({ ...popup, open: false, element: "", title: "" })
      }
      TransitionComponent={Transition}
      sx={(theme) => ({
        "&  .MuiPaper-root": {
          backgroundImage:
            theme.palette.mode === "dark"
              ? `url(${DarkBackground.src})`
              : `url(${LightBackground.src})`,
          backgroundSize: "cover",
          backdropFilter: "blur(4px)",
          // height: "100vh",
        },
        "& .MuiToolbar-root": {
          backgroundColor: "background.default",
        },
      })}
    >
      <AppBar
        sx={{
          position: "relative",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            onClick={() =>
              setPopup({ ...popup, open: false, element: "", title: "" })
            }
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography
            sx={{ ml: 2, flex: 1 }}
            variant="h6"
            color="primary"
            component="div"
          >
            {popup.title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          padding: "2rem 2rem 3rem",
          backgroundColor: "background.foreground",
          border: "0.2rem solid",
          borderColor: "divider",
          height: "inherit",
        }}
      >
        <Grid2 container spacing={4}>
          <Grid2 item size={{ xs: 12, md: 6 }}>
            {popup.element}
          </Grid2>
          <Grid2
            item
            size={{ xs: popup?.hideImage ? 12 : 0, md: 6 }}
          >
            {popup?.hideImage ? (
              popup.secondElement
            ) : (
              <Box
                className={style.projectImage}
                sx={{
                  background: `url(${popup?.image?.src || CreateImage.src})`,
                  backgroundSize: "cover",
                  borderRadius: "100rem",
                  a: {
                    color: "text.primary",
                  },
                }}
              >
                <a
                  href="https://www.freepik.com/search?format=search&last_filter=query&last_value=create+api+project&query=create+api+project"
                  target="_blank"
                  style={{ fontSize: "0.6rem" }}
                >
                  Image by freepik
                </a>
              </Box>
            )}
          </Grid2>
        </Grid2>
      </Box>
    </Dialog>
  );
};

export default FullScreenPopup;
