const { axiosGet, axiosPost, axiosDelete, axiosHead, axiosPut } = require("..");

const getAuthApi = (projectId, query) => {
  return axiosGet(`/authapi/${projectId}${query ? `?${query}` : ""}`);
};

const createAuthApi = (body) => {
  return axiosPost(`/authapi`, body);
};

const updateAuthApi = (id, body) => {
  return axiosPut(`/authapi/${id}`, body);
};

const deleteAuthApi = (id) => {
  return axiosDelete(`/authapi/${id}`);
};

export { getAuthApi, createAuthApi, updateAuthApi, deleteAuthApi };
