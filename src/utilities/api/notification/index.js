const { axiosGetSelf, axiosPatchSelf } = require("..");

export const getNotificationApi = async (limit = 10) => {
  return axiosGetSelf("/notification?limit=" + limit);
};

export const readNotificationApi = async (date) => {
  return axiosPatchSelf("/notification", {
    date: date,
  });
};
