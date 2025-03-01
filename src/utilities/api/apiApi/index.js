const { axiosHead, axiosGet, axiosPost, axiosPut, axiosDelete, axiosHeadSelf, axiosGetSelf, axiosPostSelf, axiosPatchSelf, axiosDeleteSelf } = require("..");

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
  return axiosPatchSelf(`dataapi/${apiId}`, body);
};

const updateApiDataApi = (apiId, body) => {
  return axiosPatchSelf(`dataapi/${apiId}`, body);
};

const updateApiStatusApi = (apiId, body) => {
  return axiosPatchSelf(`dataapi/${apiId}`, body);
};

const updateApiSchemaApi = (apiId, body) => {
  return axiosPatchSelf(`dataapi/${apiId}`, body);
};

const deleteApiApi = (apiId) => {
  return axiosDeleteSelf(`dataapi/${apiId}`);
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
