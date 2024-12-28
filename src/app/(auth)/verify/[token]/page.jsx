"use client";

import Verify from "@/components/auth/verify";

const Page = ({params}) => {
  const { token } = params;
  
  return <Verify token={token} redirect="/login" />;
};
export default Page;
