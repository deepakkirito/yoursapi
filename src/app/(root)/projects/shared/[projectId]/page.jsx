"use client";
import { useRouter } from "next/navigation";

const Page = (props) => {
  const projectId = props.params.projectId;

  const router = useRouter();
  router.push(`/projects/shared/${projectId}/data`);
  return null;
};
export default Page;
