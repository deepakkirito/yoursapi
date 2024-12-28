import { ArrowBack } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DisplaySettingsRoundedIcon from "@mui/icons-material/DisplaySettingsRounded";
import CustomAccordion from "../customAccordian";

const ContentBar = ({
  children,
  setOpen,
  open,
  defaultExpanded,
  onChange,
  items,
}) => {
  return (
    <Box
      className="flex flex-col gap-4"
      sx={{
        backgroundColor: "background.invert",
        padding: open ? "1rem" : "0.5rem",
        width: "100%",
        minHeight: {
          lg: "100%",
          xs: "5rem",
        },
        maxHeight: {
          lg: "100%",
          xs: "30rem",
        },
        borderRadius: open ? "0.5rem" : "3rem",
        transition: "all 0.5s",
        border: "3px solid",
        borderColor: "background.defaultSolid",
        // outline: "2px solid",
        // outlineColor: "background.defaultsolid",
        marginBottom: {
          lg: "0rem",
          xs: "5rem",
        }
      }}
    >
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
        <IconButton onClick={() => setOpen(!open)}>
          <ArrowBack
            color="secondary"
            sx={{
              rotate: open ? "180deg" : "0deg",
              transition: "all 0.5s",
              display: {
                xs: "none",
                lg: "flex",
              }
            }}
          />
        </IconButton>
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
              height: open ? "calc(100vh - 25rem)" : "calc(100vh - 24.5rem)",
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
                  right: "-3.2rem",
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
  );
};

export default ContentBar;
