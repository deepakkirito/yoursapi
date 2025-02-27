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
        tooltipTitle={"Profile Menu"}
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
                <TooltipCustom
                  title={
                    userData?.plan === "free" ? (
                      ""
                    ) : (
                      <Typography variant="h7">
                        Expires on {getDate(userData?.validity)}
                      </Typography>
                    )
                  }
                  placement="auto"
                  arrow={false}
                >
                  <span
                    style={{
                      background:
                        userData?.plan === "free"
                          ? "linear-gradient(135deg,rgba(39, 174, 95, 0.84),rgba(46, 204, 112, 0.91))"
                          : "linear-gradient(135deg,rgba(212, 175, 55, 0.3),rgba(241, 196, 15, 0.39))", // Gradient for premium feel
                      color: userData?.plan === "free" ? "#EDEDED" : "#D4AF37",
                      padding: "1px 4px",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      border:
                        userData?.plan === "free"
                          ? "1px solid rgba(39, 174, 96, 0.8)"
                          : "1px solid rgba(212, 175, 55, 0.8)",
                      boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)", // Adds subtle depth
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "1px",
                    }}
                  >
                    {userData?.plan !== "free" && (
                      <WorkspacePremiumRoundedIcon
                        fontSize="small"
                        sx={{
                          color: "#D4AF37",
                        }}
                      />
                    )}
                    {userData?.plan}
                  </span>
                </TooltipCustom>
              </div>
              <Typography variant="h7" className="mb-2">
                {userData?.email}
              </Typography>
            </div>
          </div>
          <Divider className="w-full" />
          <div className="flex gap-2 items-center my-2">
            <CloudSyncRoundedIcon fontSize="small" />
            <Typography variant="h7">Available Requests</Typography>
            <Typography
              variant="h8"
              sx={{
                width: "2rem",
                height: "2rem",
                backgroundColor: "background.defaultSolid",
                color: "text.primary",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {userData?.totalReq - userData?.usedReq || 0}
            </Typography>
          </div>
          {Boolean(userData?.additionalReq) && (
            <div className="flex gap-2 items-center my-2">
              <Typography variant="h7">Available Requests</Typography>
              <Typography variant="h7">Additional Requests</Typography>
              <Typography
                variant="h8"
                sx={{
                  width: "2rem",
                  height: "2rem",
                  backgroundColor: "background.defaultSolid",
                  color: "text.primary",
                  borderRadius: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {userData?.additionalReq}
              </Typography>
            </div>
          )}
          <Divider className="w-full" />
        </div>
      </CustomMenu>
    </Box>
  );
};

export default Profile;
