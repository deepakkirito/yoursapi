import { getGraphProjectApi } from "@/utilities/api/graphApi";
import Chart from "../chart";

const YourUsage = () => {
  return <Chart getProjectsApi={getGraphProjectApi} title={"Your Usage"} />;
};

export default YourUsage;
