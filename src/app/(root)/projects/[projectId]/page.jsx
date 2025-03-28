"use client";
import { useRouter } from "next/navigation";

const Page = (props) => {
  const projectId = props.params.projectId;

  const router = useRouter();
  router.push(`/projects/${projectId}/dataapi`);
  return null;
};
export default Page;
