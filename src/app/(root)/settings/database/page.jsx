import dynamic from "next/dynamic";
const DataBase = dynamic(() => import("@/components/pages/settings/database"), {
  ssr: false,
});

const Page = () => {
  return <DataBase />;
};

export default Page;
