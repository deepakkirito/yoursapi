import { axiosGetSelf } from "..";


export const getLogsApi = async (page, rows) => {
  return axiosGetSelf("logs?page=" + page + "&rows=" + rows);
};