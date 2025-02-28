import { VerifyApi } from "@/utilities/api/authApi";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Lottie from "react-lottie";
import Verifying from "@/components/assets/json/verifying.json";
import Verified from "@/components/assets/json/verified.json";
import VerificationFailed from "@/components/assets/json/verificationFailed.json";
import { Box, CircularProgress, Typography } from "@mui/material";

const Verify = ({ token, redirect }) => {
  const [verifyStatus, setVerifyStatus] = useState("verifying");
  const [count, setCount] = useState(0);
  const router = useRouter();

  const renderContent = useMemo(() => {
    switch (verifyStatus) {
      case "verifying":
        return (
          <>
            <Lottie
              options={{
                animationData: Verifying,
                loop: true,
                autoPlay: true,
              }}
              height={300}
              width={300}
            />
            <Typography level="heading">Verifying Email...</Typography>
            <CircularProgress width={"10rem"} />
          </>
        );
      case "verified":
        return (
          <>
            <Lottie
              options={{
                animationData: Verified,
                loop: true,
                autoPlay: true,
              }}
              height={300}
              width={300}
            />
            <Typography level="heading">Email Verified</Typography>
            <Typography>Redirecting in {count} </Typography>
          </>
        );
      case "failed":
        return (
          <>
            <Lottie
              options={{
                animationData: VerificationFailed,
                loop: true,
                autoPlay: true,
              }}
              height={300}
              width={300}
            />
            <Typography level="heading">Link expired</Typography>
            <Box className="text-center">
              <Typography color="text.primary">
                Login to resend email
              </Typography>
              <Typography color="text.primary">
                Redirecting in {count}{" "}
              </Typography>
            </Box>
          </>
        );
    }
  }, [verifyStatus, token, count]);

  useEffect(() => {
    verify();
  }, [token]);

  useEffect(() => {
    verifyStatus !== "verifying" && setCount(5);
  }, [verifyStatus]);

  useEffect(() => {
    count &&
      setTimeout(() => {
        setCount(count - 1);
      }, 1000);
    count === 1 && router.push(redirect);
  }, [count]);

  const verify = () => {
    VerifyApi(token)
      .then((res) => setVerifyStatus("verified"))
      .catch((err) => setVerifyStatus("failed"));
  };

  return (
    <Box
      className="flex justify-center items-center flex-col gap-8"
      sx={{
        backgroundColor: "background.default",
        height: "100vh",
      }}
    >
      {renderContent}
    </Box>
  );
};

export default Verify;
