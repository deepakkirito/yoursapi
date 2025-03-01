const { axiosHead, axiosGet, axiosPost, axiosPut, axiosDelete, axiosHeadSelf, axiosGetSelf, axiosPostSelf } = require("..");

const checkApiExistApi = (projectId, apiName) => {
  return axiosHeadSelf(`dataapi/${apiName}/${projectId}`);
};

const getApiDetailsApi = (apiId) => {
  return axiosGetSelf(`dataapi/${apiId}`);
};

const createApiApi = (projectId, body) => {
  return axiosPostSelf(`dataapi/${projectId}`, body);
};

const updateApiNameApi = (apiId, body) => {
  return axiosPut(`/api/${apiId}`, body);
};

const updateApiDataApi = (apiId, body) => {
  return axiosPut(`/api/data/${apiId}`, body);
};

const updateApiStatusApi = (apiId, body) => {
  return axiosPut(`/api/status/${apiId}`, body);
};

const updateApiSchemaApi = (apiId, body) => {
  return axiosPut(`/api/schema/${apiId}`, body);
};

const deleteApiApi = (apiId) => {
  return axiosDelete(`/api/${apiId}`);
};

export {
  checkApiExistApi,
  getApiDetailsApi,
  createApiApi,
  updateApiNameApi,
  updateApiDataApi,
  updateApiStatusApi,
  updateApiSchemaApi,
  deleteApiApi
};
