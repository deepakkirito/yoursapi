import { Grid2 } from "@mui/material";
import YourUsage from "./yourUsage";
import SharedUsage from "./sharedUsage";
import Logs from "./logs";

const Dashboard = () => {
  return (
    <Grid2
      container
      spacing={2}
      className="items-center h-[100%] w-[100%] overflow-y-auto"
    >
      <Grid2 size={{ xs: 12 }}>
        <YourUsage />
      </Grid2>
      <Grid2 size={{ xs: 12 }}>
        <SharedUsage />
      </Grid2>
      <Grid2 size={{ xs: 12 }}>
        <Logs />
      </Grid2>
    </Grid2>
  );
};

export default Dashboard;
