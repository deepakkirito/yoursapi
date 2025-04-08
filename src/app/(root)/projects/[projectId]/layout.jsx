"use client";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import ProjectLayout from "@/components/pages/project/server/layout";

export default function Layout({ children }) {
  const location = usePathname();
  const locationParts = location?.split("/") || [];
  const projectId = useRef(locationParts[2] || null);

  return (
    <ProjectLayout shared={false} projectId={projectId}>
      {children}
    </ProjectLayout>
  );
}
