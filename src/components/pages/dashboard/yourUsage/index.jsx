import {
  downloadCsvApi,
  getGraphLiveDataApi,
  getGraphProjectApi,
} from "@/utilities/api/graphApi";
import Chart from "../chart";

const YourUsage = () => {
  return (
    <Chart
      getProjectsApi={getGraphProjectApi}
      title={"Your Usage"}
      getLiveApi={getGraphLiveDataApi}
      csvDownloadApi={downloadCsvApi}
    />
  );
};

export default YourUsage;
