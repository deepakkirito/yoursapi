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

export const getGraphLiveDataApi = async (type, project, api, splitGraph) => {
  return axiosGetSelf(
    "graph/live?type=" +
      type +
      "&project=" +
      project +
      "&api=" +
      api +
      "&split=" +
      splitGraph
  );
};

export const getGraphLiveShareDataApi = async (type, project, api, splitGraph) => {
  return axiosGetSelf(
    "graph/live/share?type=" +
      type +
      "&project=" +
      project +
      "&api=" +
      api +
      "&split=" +
      splitGraph
  );
};

export const downloadCsvApi = async (type, project, api) => {
  return axiosGetSelf(
    "graph/live/csv?type=" + type + "&project=" + project + "&api=" + api
  );
};

export const getGraphProjectApi = async () => {
  return axiosGetSelf("graph/project");
};

export const getGraphProjectShareApi = async () => {
  return axiosGetSelf("graph/project/share");
};
