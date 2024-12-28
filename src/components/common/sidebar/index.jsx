"use client";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import { useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  mainList,
  mainListUrl,
  projectList,
} from "@/components/assets/constants/barList";
import Link from "next/link";
import TooltipCustom from "../tooltip";
import {
  ArrowLeftRounded,
  KeyboardArrowLeftRounded,
} from "@mui/icons-material";
import { CreateSidebarContext } from "@/utilities/context/sidebar";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Sidebar = () => {
  const location = usePathname();
  const theme = useTheme();
  const { open, setOpen } = useContext(CreateSidebarContext);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isProjectLink, setIsProjectLink] = useState(false);

  useEffect(() => {
    if (mainListUrl.includes(location)) {
      setIsProjectLink(true);
    } else {
      setIsProjectLink(false);
    }
  }, [location]);

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  const handleDrawerClose = () => {
    setOpen(!open);
  };

  const data = useMemo(() => {
    if (isProjectLink) {
      return mainList;
    }
    return projectList;
  }, [isProjectLink]);

  return (
    <Box>
      <Drawer
        sx={{
          width: "100%",
          flexShrink: 0,
          height: "calc(100vh - 7rem)",
          transition: "all 500ms",
          "& .MuiDrawer-paper": {
            width: "100%",
            boxSizing: "border-box",
            transition: "all 500ms",
            borderRadius: "1rem",
            border: "0.1px solid",
            borderColor: "background.inactive",
          },
          "& .MuiPaper-root": {
            position: "relative",
            transition: "all 500ms",
            backgroundColor: {
              xs: "background.defaultSolid",
              md: "background.default",
            },
            overflow: "hidden",
          },
          "& .MuiTypography-root": {
            fontSize: open ? "1rem" : "0rem !important",
            opacity: open ? "1" : "0 !important",
            transition: "all 1000ms, color 10ms",
          },
          "& .MuiButtonBase-root": {
            transition: "all 1000ms, color 10ms",
          },
        }}
        variant="persistent"
        // anchor="left"
        open={true}
      >
        <DrawerHeader>
          <Box
            className={`w-[100%] flex justify-${
              mainListUrl.includes(location) ? "end" : "between"
            }`}
          >
            {open && !mainListUrl.includes(location) && (
              <TooltipCustom title="Back" placement="right">
                <Link href={"/projects"}>
                  <IconButton>
                    <KeyboardArrowLeftRounded color="secondary" />
                  </IconButton>
                </Link>
              </TooltipCustom>
            )}
            <IconButton onClick={handleDrawerClose}>
              {open ? <MenuOpenRoundedIcon color="secondary" /> : <MenuRoundedIcon color="secondary" />}
            </IconButton>
          </Box>
        </DrawerHeader>
        <Divider />
        <List>
          {data?.map((item, index) => {
            if (item.name === "divider") {
              return <Divider key={index} className="my-2" />;
            }
            if (item.name === "header") {
              return (
                <div key={index}>
                  {open && (
                    <InputLabel className="px-4 pb-2">{item.label}</InputLabel>
                  )}
                </div>
              );
            }
            return (
              <Link key={index} href={item.link}>
                <ListItem key={item.link} disablePadding>
                  <ListItemButton
                    onClick={() => isMobile && setOpen(false)}
                    sx={{
                      backgroundColor: isProjectLink
                        ? location === item.link
                          ? "background.inactive"
                          : "transparent"
                        : location.includes(item.link)
                          ? "background.inactive"
                          : "transparent",
                      boxShadow: isProjectLink
                        ? location === item.link
                          ? `0 0 1rem ${theme.palette.background.active} inset`
                          : "none"
                        : location.includes(item.link)
                          ? `0 0 1rem ${theme.palette.background.active} inset`
                          : "none",
                      color: theme.palette.text.primary,
                    }}
                  >
                    <TooltipCustom
                      title={open ? "" : item.name}
                      placement="right"
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                    </TooltipCustom>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              </Link>
            );
          })}
        </List>
        <Divider />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
