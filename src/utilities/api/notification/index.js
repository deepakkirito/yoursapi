const { axiosGetSelf, axiosPatchSelf } = require("..");

export const getNotificationApi = async (limit, row) => {
  return axiosGetSelf("/notification?limit=" + limit + "&skip=" + row);
};

export const readNotificationApi = async (date) => {
  return axiosPatchSelf("/notification", {
    date: date,
  });
};
