import AuthApi from "@/components/pages/api/auth";

const Page = () => {
  return (
    <div>
      <AuthApi shared={true} />
    </div>
  );
};

export default Page;
