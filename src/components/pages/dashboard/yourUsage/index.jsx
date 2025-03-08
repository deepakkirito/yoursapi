import { getGraphProjectApi } from "@/components/pages/api/graph";
import Chart from "../chart";

const YourUsage = () => {
  return <Chart getProjectsApi={getGraphProjectApi} title={"Your Usage"} />;
};

export default YourUsage;
