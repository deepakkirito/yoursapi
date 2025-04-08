import { LogoutApi } from "@/utilities/api/authApi";
import { Avatar, Box, Divider, Typography, useTheme } from "@mui/material";
import CustomMenu from "../../customMenu";
import { Logout } from "@mui/icons-material";
import Image from "next/image";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import TooltipCustom from "../../tooltip";
import { getDate } from "@/utilities/helpers/functions";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import SurroundSoundRoundedIcon from "@mui/icons-material/SurroundSoundRounded";
import AutofpsSelectRoundedIcon from "@mui/icons-material/AutofpsSelectRounded";

const Profile = ({ userData, setLogin, router }) => {
  const { palette } = useTheme();

  return (
    <Box className="flex gap-0 items-center">
      <CustomMenu
        tooltipPlacement="left"
        menuPosition="right"
        icon={
          userData?.profile && (
            <Image
              src={userData?.profile}
              alt="profile"
              width={32}
              height={0}
              style={{
                height: "auto",
                borderRadius: "2rem",
              }}
            />
          )
        }
        options={[
          {
            icon: <AccountCircleRoundedIcon fontSize="small" />,
            name: "Profile Settings",
            onClick: () => router.push("/profile"),
          },

          {
            icon: <Logout fontSize="small" />,
            name: "Logout",
            onClick: async () => {
              await LogoutApi();
              setLogin(false);
              router.push("/login");
            },
          },
        ]}
      >
        <div className="flex items-center flex-col p-2">
          <div className="flex items-center p-2 gap-4">
            <Image
              src={userData?.profile}
              key={userData?.profile}
              alt="profile"
              width={90}
              height={90}
              className="rounded-full"
              style={{
                border: "0.1rem solid",
                borderColor: palette.background.defaultSolid,
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Typography variant="h6">{userData?.name}</Typography>
              </div>
              <Typography variant="h7" className="mb-2">
                {userData?.email}
              </Typography>
            </div>
          </div>
          <Divider className="w-full" />
          <div className="flex gap-2 items-center my-2">
            <CloudSyncRoundedIcon fontSize="small" />
            <Typography variant="h7">Available Credits</Typography>
            <Typography
              variant="h8"
              sx={{
                minWidth: "2rem",
                maxWidth: "fit-content",
                height: "2rem",
                backgroundColor: "background.foreground",
                color: "text.primary",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid",
                borderColor: "background.border",
                padding: "0 0.5rem",
              }}
            >
              {userData?.credits?.data || 0}
            </Typography>
          </div>
          <Divider className="w-full" />
        </div>
      </CustomMenu>
    </Box>
  );
};

export default Profile;
