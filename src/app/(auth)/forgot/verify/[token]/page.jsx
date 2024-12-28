"use client";

import Verify from "@/components/auth/verify";

const Page = ({params}) => {
  const { token } = params;
  
  return <Verify token={token} redirect={`/forgot/reset?id=${token}`} />;
};
export default Page;
