import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import HideSourceRoundedIcon from '@mui/icons-material/HideSourceRounded';

const mainList = [
  {
    link: "/dashboard",
    name: "Dashboard",
    icon: <SpaceDashboardRoundedIcon color="secondary" />,
  },
  {
    link: "/projects",
    name: "Projects",
    icon: <AccountTreeRoundedIcon color="secondary" />,
  },
  {
    link: "/projects/shared",
    name: "Shared Projects",
    icon: <SendRoundedIcon color="secondary" />,
  },
  {
    link: "/projects/inactive",
    name: "Inactive Projects",
    icon: <HideSourceRoundedIcon color="secondary" />,
  },
  {
    name: "divider",
  },
  {
    name: "header",
    label: "Settings",
  },
  {
    link: "/settings/database",
    name: "Database",
    icon: <StorageRoundedIcon color="secondary" />,
  }
];

const projectList = [
  {
    link: "data",
    name: "Data Api",
    icon: <SpaceDashboardRoundedIcon color="secondary" />,
  },
  {
    link: "auth",
    name: "Auth Api",
    icon: <AccountTreeRoundedIcon color="secondary" />,
  },
  {
    link: "websockets",
    name: "Websockets Api",
    icon: <AccountTreeRoundedIcon color="secondary" />,
  },
];

const mainListUrl = mainList.map((item) => item.link);

export { mainList, projectList, mainListUrl };
