import dynamic from "next/dynamic";
const Auth = dynamic(() => import("@/components/auth"), { ssr: false });

const Page = () => {
  return <Auth auth="login" />;
};
export default Page;
