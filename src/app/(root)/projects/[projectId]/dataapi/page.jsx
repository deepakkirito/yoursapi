import DataApi from "@/components/pages/api/data";
import { Box } from "@mui/material";

const Page = (props) => {
  return (
    <Box
      className="pr-2"
      sx={{
        height: {
          xs: "90vh",
          lg: "100%",
        },
        overflow: "auto",
      }}
    >
      <DataApi />
    </Box>
  );
};

export default Page;
