import { getGraphProjectApi } from "@/utilities/api/graphApi";
import Chart from "../chart";

const SharedUsage = () => {
  return <Chart getProjectsApi={getGraphProjectApi} title="Shared Usage" />;
};

export default SharedUsage;
