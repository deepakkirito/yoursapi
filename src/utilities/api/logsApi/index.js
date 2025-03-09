import { axiosGetSelf } from "..";

export const getLogsApi = async (
  page,
  rows,
  search,
  order,
  orderBy,
  logType
) => {
  return axiosGetSelf(
    "logs?page=" +
      page +
      "&rows=" +
      rows +
      "&search=" +
      search +
      "&order=" +
      order +
      "&orderBy=" +
      orderBy +
      "&logType=" +
      logType
  );
};
