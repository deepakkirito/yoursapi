const { axiosGetSelf, axiosDeleteSelf } = require("..");

const getSessionsApi = () => {
  return axiosGetSelf(`/session`);
};

const deleteSessionApi = (id) => {
  return axiosDeleteSelf(`/session/${id}`);
};

export { getSessionsApi, deleteSessionApi };
