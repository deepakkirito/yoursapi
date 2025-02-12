const { axiosGet, axiosPost, axiosDelete, axiosHead, axiosPut } = require("..");

const getAuthApi = (projectId) => {
  return axiosGet(`/authapi/${projectId}`);
};

const createAuthApi = (body) => {
  return axiosPost(`/authapi`, body);
};

const updateAuthApi = (id, body) => {
  return axiosPut(`/authapi/${id}`, body);
};

export { getAuthApi, createAuthApi, updateAuthApi };
