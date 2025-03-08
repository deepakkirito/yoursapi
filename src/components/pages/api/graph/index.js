import { axiosGetSelf } from "@/utilities/api";

export const getGraphDataApi = async (
  period,
  type,
  project,
  api,
  dateFrom,
  dateTo
) => {
  return axiosGetSelf(
    "graph?period=" +
      period +
      "&type=" +
      type +
      "&project=" +
      project +
      "&api=" +
      api +
      "&dateFrom=" +
      dateFrom +
      "&dateTo=" +
      dateTo
  );
};

export const getGraphProjectApi = async () => {
  return axiosGetSelf("graph/project");
};
