import { ArrowBack, Fullscreen, FullscreenExit } from "@mui/icons-material";
import { Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import DisplaySettingsRoundedIcon from "@mui/icons-material/DisplaySettingsRounded";
import CustomAccordion from "../customAccordian";
import { usePathname } from "next/navigation";

const ContentBar = ({
  children,
  setOpen,
  open,
  defaultExpanded,
  onChange,
  items,
}) => {
  const [fullScreen, setFullScreen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1200px)");
  const location = usePathname();
  useState(() => {
    if (isMobile) {
      setOpen(true);
    }
  }, [isMobile, location]);

  return (
    <Box
      sx={{
        backgroundColor: "background.invert",
        padding: "0.5rem",
        width: open ? "100%" : "4.9rem",
        height: "100%",
        borderRadius: open ? "0.5rem" : "3rem",
        transition: "all 0.5s",
        border: "3px solid",
        borderColor: "background.defaultSolid",
        marginBottom: {
          lg: "0rem",
          xs: "5rem",
        },
      }}
    >
      <Box
        className="flex flex-col gap-2 rounded-lg"
        sx={{
          overflow: "auto",
          position: fullScreen ? "fixed" : "relative",
          top: fullScreen ? "10vh" : "0",
          left: fullScreen ? "1vw" : "0",
          zIndex: fullScreen ? "100" : "0",
          width: fullScreen ? "98vw" : "100%",
          minHeight: {
            lg: fullScreen ? "85vh" : "100%",
            xs: fullScreen ? "85vh" : "5rem",
          },
          maxHeight: {
            lg: open
              ? fullScreen
                ? "85vh"
                : "30rem"
              : fullScreen
                ? "85vh"
                : "100%",
            xs: fullScreen ? "90vh" : "30rem",
          },
          transition: "all 0.5s",
          backgroundColor: fullScreen ? "background.invert" : "none",
          paddingBottom: fullScreen ? "5vh" : "0",
        }}
      >
        <Box
          className={`flex items-center sticky top-0 z-10`}
          sx={{
            backgroundColor: "background.defaultSolid",
            borderRadius: open ? "0.5rem" : "3rem",
            justifyContent: open ? "space-between" : "flex-end",
            padding: open ? "0.5rem 1rem" : "0.5rem",
            transition: "all 0.5s",
            border: "1px solid",
            borderColor: "background.invert",
          }}
        >
          <Box className="flex items-center gap-2">
            {open && <DisplaySettingsRoundedIcon color="secondary" />}
            <Typography
              variant="h7"
              className="text-break"
              sx={{
                fontWeight: "700",
                color: "text.primary",
                fontSize: open ? "1rem" : "0rem",
                transition: "all 0.5s",
              }}
            >
              Data Creation, settings and more...
            </Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <IconButton onClick={() => setFullScreen(!fullScreen)}>
              {fullScreen ? (
                <FullscreenExit
                  sx={{
                    display: {
                      xs: "none",
                      lg: "flex",
                    },
                  }}
                />
              ) : (
                <Fullscreen
                  sx={{
                    display: {
                      xs: "none",
                      lg: "flex",
                    },
                  }}
                />
              )}
            </IconButton>
            <IconButton
              onClick={() => {
                setOpen(!open);
                setFullScreen(false);
              }}
            >
              <ArrowBack
                color="secondary"
                sx={{
                  rotate: open ? "180deg" : "0deg",
                  transition: "all 0.5s",
                  display: {
                    xs: "none",
                    lg: "flex",
                  },
                }}
              />
            </IconButton>
          </Box>
        </Box>
        {!open && (
          <Box
            className={`flex items-center`}
            sx={{
              backgroundColor: "background.defaultSolid",
              borderRadius: open ? "0.5rem" : "3rem",
              justifyContent: open ? "space-between" : "flex-end",
              padding: open ? "0.5rem 1rem" : "0.5rem",
              transition: "all 0.5s",
            }}
          >
            <Box
              sx={{
                height: open ? "calc(100vh - 25rem)" : "calc(100vh - 21.5rem)",
                overflow: "auto",
                transition: "all 0.5s",
                width: "100%",
                paddingTop: "0.5rem",
              }}
            >
              {!open && (
                <Typography
                  variant="h7"
                  className=""
                  sx={{
                    rotate: "-90deg",
                    width: "max-content",
                    position: "absolute",
                    right: "-3.3rem",
                    transform: "translateX(calc(-25vh))",
                    fontWeight: "700",
                    color: "text.primary",
                    fontSize: !open ? "1rem" : "0rem",
                    transition: "all 0.5s",
                  }}
                >
                  Data Creation, settings and more...
                </Typography>
              )}
            </Box>
          </Box>
        )}
        {open && (
          <CustomAccordion
            items={items}
            defaultExpanded={defaultExpanded}
            onChange={onChange}
          />
        )}
      </Box>
    </Box>
  );
};

export default ContentBar;
