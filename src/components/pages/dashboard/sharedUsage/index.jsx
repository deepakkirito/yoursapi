import { getGraphProjectApi } from "@/components/pages/api/graph";
import Chart from "../chart";

const SharedUsage = () => {
  return <Chart getProjectsApi={getGraphProjectApi} title="Shared Usage" />;
};

export default SharedUsage;
