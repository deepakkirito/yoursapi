"use client";

import Settings from "@/components/pages/project/server/settings";
import { CreateProjectDataContext } from "@/utilities/context/projectData";
import { CreateServerTabContext } from "@/utilities/context/serverTab";
import { useContext, useEffect } from "react";

export default function Layout() {
  const { activeTab, setActiveTab } = useContext(CreateServerTabContext);
  const { environment, setEnvironment, projectData, setProjectData } =
    useContext(CreateProjectDataContext);

  useEffect(() => {
    setActiveTab(2);
  }, []);
  
  return (
    <div className="h-[inherit]">
      <Settings
        shared={false}
        projectId={projectData?._id}
        environment={environment}
        projectData={projectData}
        setProjectData={setProjectData}
      />
    </div>
  );
}
