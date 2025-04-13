import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import HideSourceRoundedIcon from "@mui/icons-material/HideSourceRounded";
import DataArrayRoundedIcon from "@mui/icons-material/DataArrayRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import StreamRoundedIcon from "@mui/icons-material/StreamRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ImportantDevicesRoundedIcon from "@mui/icons-material/ImportantDevicesRounded";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import SubscriptionsRoundedIcon from "@mui/icons-material/SubscriptionsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

const mainList = [
  {
    link: "/dashboard",
    name: "Overview",
    icon: <SpaceDashboardRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/projects",
    name: "Projects",
    icon: <AccountTreeRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/projects/shared",
    name: "Shared Projects",
    icon: <SendRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/projects/inactive",
    name: "Inactive Projects",
    icon: <HideSourceRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/teams",
    name: "Teams",
    icon: <StorageRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    name: "divider",
  },
  // {
  //   name: "header",
  //   label: "Settings",
  // },
  {
    link: "/billing",
    name: "Billing",
    icon: <StorageRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/support",
    name: "Support",
    icon: <StorageRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/referral",
    name: "Referral",
    icon: <StorageRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/documentation",
    name: "Documentation",
    icon: <StorageRoundedIcon color="secondary" fontSize="small" />,
  },
];

const projectList = [
  {
    link: "server",
    name: "Server",
    icon: <DataArrayRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    name: "divider",
  },
  {
    name: "header",
    label: "Youpi Api",
  },
  {
    link: "dataapi",
    name: "Data Api",
    icon: <DataArrayRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "authapi",
    name: "Auth Api",
    icon: <LockRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "websocketapi",
    name: "Websockets Api",
    icon: <StreamRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    name: "divider",
  },
  {
    name: "header",
    label: "Api Settings",
  },
  {
    link: "database",
    name: "Database",
    icon: <StorageRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "instance",
    name: "Instance",
    icon: <ElectricalServicesIcon color="secondary" fontSize="small" />,
  },
];

const profileList = [
  {
    link: "/profile",
    name: "Profile",
    icon: <AccountCircleRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/profile/sessions",
    name: "Sessions",
    icon: <ImportantDevicesRoundedIcon color="secondary" fontSize="small" />,
  },
];

const adminList = [
  {
    link: "/admin/subscriptions",
    name: "Subscriptions",
    icon: <SubscriptionsRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/admin/users",
    name: "Users",
    icon: <PeopleAltRoundedIcon color="secondary" fontSize="small" />,
  },
  {
    link: "/admin/projects",
    name: "Projects",
    icon: <StorageRoundedIcon color="secondary" fontSize="small" />,
  },
];

const mainListUrl = mainList.map((item) => item.link);

export { mainList, projectList, mainListUrl, profileList, adminList };
