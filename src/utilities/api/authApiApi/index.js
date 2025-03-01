const { axiosGet, axiosPost, axiosDelete, axiosHead, axiosPut, axiosGetSelf, axiosPostSelf, axiosPatchSelf, axiosDeleteSelf } = require("..");

const getAuthApi = (projectId, query) => {
  return axiosGetSelf(`authapi/${projectId}${query ? `?${query}` : ""}`);
};

const createAuthApi = (id, body) => {
  return axiosPostSelf(`authapi/${id}`, body);
};

const updateAuthApi = (id, body) => {
  return axiosPatchSelf(`authapi/${id}`, body);
};

const deleteAuthApi = (id) => {
  return axiosDeleteSelf(`authapi/${id}`);
};

export { getAuthApi, createAuthApi, updateAuthApi, deleteAuthApi };
