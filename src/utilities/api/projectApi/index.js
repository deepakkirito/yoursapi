const {
  axiosGet,
  axiosPost,
  axiosDelete,
  axiosHead,
  axiosPut,
  axiosHeadSelf,
  axiosGetSelf,
  axiosPostSelf,
  axiosPatchSelf,
  axiosDeleteSelf,
  axiosPutSelf,
} = require("..");

const checkProjectExistApi = (projectName) => {
  return axiosHeadSelf(`project/check/${projectName}`);
};

export const checkProjectExistAllApi = (projectName, projectId) => {
  return axiosHeadSelf(`project/check/${projectName}/${projectId}`);
};

const getProjectApi = (pagination, search, filter, sort) => {
  return axiosGetSelf(
    `project?page=${pagination.page}&rows=${pagination.rowsPerPage}${search ? `&search=${search}` : ""}${filter ? `&filter=${filter}&sort=${sort}` : ""}`
  );
};

const getInactiveProjectApi = (pagination, search, filter, sort) => {
  return axiosGetSelf(
    `project/inactive?page=${pagination.page}&rows=${pagination.rowsPerPage}${search ? `&search=${search}` : ""}${filter ? `&filter=${filter}&sort=${sort}` : ""}`
  );
};

const getSharedProjectApi = (pagination, search, filter, sort) => {
  return axiosGetSelf(
    `project/share?page=${pagination.page}&rows=${pagination.rowsPerPage}${search ? `&search=${search}` : ""}${filter ? `&filter=${filter}&sort=${sort}` : ""}`
  );
};

const getSingleProjectApi = async (id) => {
  return await axiosGetSelf(`project/${id}`);
};

const getSingleShareProjectAccessApi = (id) => {
  return axiosGetSelf(`project/access/${id}`);
};

const createProjectApi = (body) => {
  return axiosPostSelf(`project`, body);
};

const updatePermissionApi = (id, body) => {
  return axiosPatchSelf(`project/access/${id}`, body);
};

export const checkOtherUserApi = (id, email) => {
  return axiosGetSelf(`project/access/${id}/${email}`);
};

const shareProjectApi = (id, body) => {
  return axiosPostSelf(`project/access/${id}`, body);
};

const revokeSharedProjectApi = (id, body) => {
  return axiosPutSelf(`project/access/${id}`, body);
};

const restoreProjectApi = (id) => {
  return axiosPutSelf(`project/${id}`);
};

const inactiveProjectApi = (id) => {
  return axiosDeleteSelf(`project/${id}?soft=true`);
};

const deleteProjectApi = (id) => {
  return axiosDeleteSelf(`project/${id}?soft=false`);
};

const updateProjectNameApi = (id, body) => {
  return axiosPut(`/project/${id}`, body);
};

const updateSharedProjectNameApi = (id, body) => {
  return axiosPut(`/project/share/${id}`, body);
};

export {
  getProjectApi,
  createProjectApi,
  deleteProjectApi,
  inactiveProjectApi,
  checkProjectExistApi,
  getInactiveProjectApi,
  restoreProjectApi,
  getSharedProjectApi,
  getSingleShareProjectAccessApi,
  shareProjectApi,
  revokeSharedProjectApi,
  updatePermissionApi,
  getSingleProjectApi,
  updateProjectNameApi,
  updateSharedProjectNameApi,
};
