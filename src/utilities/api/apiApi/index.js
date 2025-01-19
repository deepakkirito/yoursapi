const { axiosHead, axiosGet, axiosPost, axiosPut } = require("..");

const checkApiExistApi = (projectId, apiName) => {
  return axiosHead(`/api/${projectId}/${apiName}`);
};

const getApiDetailsApi = (apiId) => {
  return axiosGet(`/api/${apiId}`);
};

const createApiApi = (projectId, body) => {
  return axiosPost(`/api/${projectId}`, body);
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

export {
  checkApiExistApi,
  getApiDetailsApi,
  createApiApi,
  updateApiNameApi,
  updateApiDataApi,
  updateApiStatusApi,
  updateApiSchemaApi,
};
