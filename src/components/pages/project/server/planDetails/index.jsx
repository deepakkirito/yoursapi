import { Box, Typography } from "@mui/material";

const PlanDetails = ({ data }) => {
  console.log(data);

  return (
    <Box
      className="flex flex-col gap-2 items-start justify-left"
      component={"ul"}
    >
      <Typography variant="h8" component={"li"}>
        Machine Details: {data.machineType.description}
      </Typography>
      <Typography variant="h8" component={"li"}>
        CPU Details: {data.cpuType.description} x {data.cpus.description}
      </Typography>
      <Typography variant="h8" component={"li"}>
        Ram Details: {data.ram.description} x {data.ram.description}
      </Typography>
    </Box>
  );
};

export default PlanDetails;
