import AuthApi from "@/components/pages/api/auth";

const Page = () => {
  return (
    <div className="pr-2">
      <AuthApi shared={true} />
    </div>
  );
};

export default Page;
