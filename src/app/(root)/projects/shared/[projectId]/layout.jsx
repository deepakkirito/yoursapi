"use client";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import ProjectLayout from "@/components/pages/project/server/layout";

export default function Layout({ children }) {
  const location = usePathname();
  const locationParts = location?.split("/") || [];
  const projectId = useRef(locationParts[3] || null);

  return (
    <ProjectLayout shared={true} projectId={projectId}>
      {children}
    </ProjectLayout>
  );
}
