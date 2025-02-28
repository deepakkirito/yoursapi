"use client";

import Verify from "@/components/auth/verify";

const Page = async ({params}) => {
  const { token } = await params;
  
  return <Verify token={token} redirect={`/forgot/reset?id=${token}`} />;
};
export default Page;
