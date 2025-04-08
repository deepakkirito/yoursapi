"use client";
import Metrics from "@/components/pages/project/server/metrics";
import { CreateProjectDataContext } from "@/utilities/context/projectData";
import { CreateServerTabContext } from "@/utilities/context/serverTab";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef } from "react";

export default function Layout({ children }) {
  const { environment, setEnvironment, projectData, setProjectData } =
    useContext(CreateProjectDataContext);
  const { activeTab, setActiveTab } = useContext(CreateServerTabContext);

  useEffect(() => {
    setActiveTab(1);
  }, []);


  return (
    <div className="h-[inherit]">
      <Metrics
        shared={false}
        projectId={projectData?._id}
        environment={environment}
        projectData={projectData}
      >
        {children}
      </Metrics>
    </div>
  );
}
