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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import { useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import TooltipCustom from "../tooltip";
import { KeyboardArrowLeftRounded } from "@mui/icons-material";
import {
  adminList,
  mainList,
  mainListUrl,
  profileList,
  projectList,
} from "@/components/assets/constants/barList";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import useCustomWindow from "@/utilities/helpers/hooks/window";
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
  const { sidebarOpen, setSidebarOpen } = useContext(CreateSidebarContext);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isIncluded, setIsIncluded] = useState(false);
  const window = useCustomWindow();

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const data = useMemo(() => {
    if (location.includes("/profile")) {
      setIsIncluded(false);
      return profileList;
    }

    if (location.includes("/admin")) {
      setIsIncluded(false);
      return adminList;
    }

    // if (mainListUrl.includes(location)) {
    setIsIncluded(false);
    return mainList;
    // }
    // setIsIncluded(true);
    // return projectList;
  }, [location]);

  const isProjectLink = useMemo(
    () => mainListUrl.includes(location),
    [location]
  );

  return (
    <Box className="w-full h-full">
      <Drawer
        sx={{
          width: "100%",
          flexShrink: 0,
          height: "100%",
          transition: "all 500ms",
          "& .MuiDrawer-paper": {
            border: "0.2rem solid",
            borderTop: "0.1rem solid",
            borderRight: "0.1rem solid",
            borderColor: "divider",
            width: "100%",
            boxSizing: "border-box",
          },
          "& .MuiPaper-root": {
            position: "relative",
            transition: "all 500ms",
            backgroundColor: {
              xs: "background.defaultSolid",
              md: "background.foreground",
            },
            overflow: "hidden",
          },
          "& .MuiTypography-root": {
            fontSize: sidebarOpen ? "0.9rem" : "0rem !important",
            opacity: sidebarOpen ? "1" : "0 !important",
            transition: "all 1000ms, color 10ms",
          },
        }}
        variant="persistent"
        open
      >
        <DrawerHeader>
          <Box
            className={`w-[100%] flex justify-${isProjectLink ? "end" : "between"}`}
          >
            {sidebarOpen && !isProjectLink && (
              <TooltipCustom title="Back" placement="right">
                <IconButton onClick={() => window.history.back()}>
                  <KeyboardArrowLeftRounded color="secondary" />
                </IconButton>
              </TooltipCustom>
            )}
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? (
                <MenuOpenRoundedIcon color="secondary" />
              ) : (
                <MenuRoundedIcon color="secondary" />
              )}
            </IconButton>
          </Box>
        </DrawerHeader>
        <Divider />
        <List>
          {data?.map((item, index) => {
            if (item.name === "divider")
              return <Divider key={index} className="my-2" />;
            if (item.name === "header") {
              return sidebarOpen ? (
                <InputLabel key={index} className="px-4" shrink>
                  {item.label}
                </InputLabel>
              ) : null;
            }
            return (
              <Link key={index} href={item.link}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => isMobile && setSidebarOpen(false)}
                    sx={{
                      backgroundColor: !isIncluded
                        ? location === item.link
                          ? "background.defaultSolid"
                          : "transparent"
                        : location.includes(item.link)
                          ? "background.defaultSolid"
                          : "transparent",
                      // boxShadow: !isIncluded
                      //   ? location === item.link
                      //     ? `0 0 1rem ${theme.palette.background.invert} inset`
                      //     : "none"
                      //   : location.includes(item.link)
                      //     ? `0 0 1rem ${theme.palette.background.invert} inset`
                      //     : "none",
                      color: theme.palette.text.primary,
                    }}
                  >
                    <TooltipCustom
                      title={sidebarOpen ? "" : item.name}
                      placement="right"
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: "2rem",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
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
