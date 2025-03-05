"use client";

import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";
import TooltipCustom from "../tooltip";
import Image from "next/image";

const CustomMenu = ({
  icon,
  tooltipTitle,
  tooltipPlacement = "right",
  menuPosition = "left",
  options = [],
  children,
  getUser = () => {},
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Box>
        <TooltipCustom title={tooltipTitle} placement={tooltipPlacement}>
          <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
            {icon}
          </IconButton>
        </TooltipCustom>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "left" }}
        anchorOrigin={{ horizontal: menuPosition, vertical: "bottom" }}
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
          },
        })}
      >
        {children}
        {options?.length ? (
          options.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                handleClose();
                getUser(item.email);
                item.onClick && item.onClick();
              }}
              className="flex gap-2 items-center py-3"
              sx={{
                "&:hover": {
                  backgroundColor: "background.foreground",
                },
              }}
            >
              {item.profile && (
                <Image
                  src={item.profile}
                  alt="profile"
                  width={42}
                  height={42}
                  className="rounded-full"
                />
              )}
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <Box className="flex flex-col">
                <Typography variant="h7" fontWeight={"bold"}>
                  {item.name}
                </Typography>
                <Typography variant="h7">{item.email}</Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Typography className="px-4 py-1">No users found</Typography>
        )}
      </Menu>
    </div>
  );
};

export default CustomMenu;
