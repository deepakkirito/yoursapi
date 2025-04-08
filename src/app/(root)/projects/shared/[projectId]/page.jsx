"use client";

import { CreateServerTabContext } from "@/utilities/context/serverTab";
import { useContext, useEffect } from "react";

export default function Page() {
  const { activeTab, setActiveTab } = useContext(CreateServerTabContext);

  useEffect(() => {
    setActiveTab(0);
  }, []);

  return <div className="h-[inherit]">Dashboard</div>;
}
