"use client";

import Verify from "@/components/auth/verify";

const Page = async ({params}) => {
  const { token } = await params;
  
  return <Verify token={token} redirect="/login" />;
};
export default Page;
