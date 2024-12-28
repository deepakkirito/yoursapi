"use client";
import { Box } from "@mui/material";
import { Suspense, useContext } from "react";
import { CircularProgress } from "@mui/material";
import ProjectLayout from "@/components/pages/project/projectLayout";
import { getProjectApi, inactiveProjectApi } from "@/utilities/api/projectApi";
import AutoDeleteRoundedIcon from "@mui/icons-material/AutoDeleteRounded";
import { CreatePopupContext } from "@/utilities/context/popup";
import ShareProject from "../shareProject";
import ShareProjectimage from "@/components/assets/svg/shareProject.svg";

export default function MainProject() {
  const { popup, setPopup } = useContext(CreatePopupContext);

  return (
    <Suspense fallback={<CircularProgress />}>
      <Box
        sx={{
          // backgroundColor: "background.invert",
          height: "calc(100vh - 7rem)",
          overflow: "auto",
        }}
      >
        <ProjectLayout
          title={"Projects"}
          getApi={getProjectApi}
          deleteData={{
            api: inactiveProjectApi,
            icon: <AutoDeleteRoundedIcon color="secondary" />,
            tooltip: "Deactivate project",
          }}
          alertContent={
            "Your project will be inactive, all the apis within the project will stop working."
          }
          openshare={(id) =>
            setPopup({
              ...popup,
              open: true,
              title: "Share Project",
              element: <ShareProject id={id} />,
              image: ShareProjectimage,
            })
          }
        />
      </Box>
    </Suspense>
  );
}
