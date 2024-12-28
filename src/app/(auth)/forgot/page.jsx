import dynamic from "next/dynamic";
const Auth = dynamic(() => import("@/components/auth"), { ssr: false });

const Page = () => {
  return <Auth auth="forgot" />;
};
export default Page;
