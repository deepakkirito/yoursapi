import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import HideSourceRoundedIcon from "@mui/icons-material/HideSourceRounded";
import DataArrayRoundedIcon from "@mui/icons-material/DataArrayRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import StreamRoundedIcon from "@mui/icons-material/StreamRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ImportantDevicesRoundedIcon from '@mui/icons-material/ImportantDevicesRounded';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import SubscriptionsRoundedIcon from '@mui/icons-material/SubscriptionsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

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
  },
];

const projectList = [
  {
    link: "dataapi",
    name: "Data Api",
    icon: <DataArrayRoundedIcon color="secondary" />,
  },
  {
    link: "authapi",
    name: "Auth Api",
    icon: <LockRoundedIcon color="secondary" />,
  },
  {
    link: "websocketapi",
    name: "Websockets Api",
    icon: <StreamRoundedIcon color="secondary" />,
  },
  {
    name: "divider",
  },
  {
    name: "header",
    label: "Settings",
  },
  {
    link: "database",
    name: "Database",
    icon: <StorageRoundedIcon color="secondary" />,
  },
  {
    link: "instance",
    name: "Instance",
    icon: <ElectricalServicesIcon color="secondary" />,
  }
];

const profileList = [
  {
    link: "/profile",
    name: "Profile",
    icon: <AccountCircleRoundedIcon color="secondary" />,
  },
  {
    link: "/profile/sessions",
    name: "Sessions",
    icon: <ImportantDevicesRoundedIcon color="secondary" />,
  },
];

const adminList = [
  {
    link: "/admin/subscriptions",
    name: "Subscriptions",
    icon: <SubscriptionsRoundedIcon color="secondary" />,
  },
  {
    link: "/admin/users",
    name: "Users",
    icon: <PeopleAltRoundedIcon color="secondary" />,
  },
  {
    link: "/admin/projects",
    name: "Projects",
    icon: <StorageRoundedIcon color="secondary" />,
  },
];

const mainListUrl = mainList.map((item) => item.link);

export { mainList, projectList, mainListUrl, profileList, adminList };
