const { axiosGet, axiosPost, axiosDelete, axiosHead, axiosPut } = require("..");

const getSessionsApi = () => {
  return axiosGet(`/session`);
};

const deleteSessionApi = (id) => {
  return axiosDelete(`/session/${id}`);
};

export { getSessionsApi, deleteSessionApi };
