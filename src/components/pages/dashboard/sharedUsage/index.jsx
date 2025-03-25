import {
  getGraphLiveShareDataApi,
  getGraphProjectApi,
  getGraphProjectShareApi,
} from "@/utilities/api/graphApi";
import Chart from "../chart";

const SharedUsage = () => {
  return (
    <Chart
      getProjectsApi={getGraphProjectShareApi}
      title="Shared Usage"
      getLiveApi={getGraphLiveShareDataApi}
    />
  );
};

export default SharedUsage;
