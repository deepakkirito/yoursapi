const {
  axiosGet,
  axiosPost,
  axiosDelete,
  axiosHead,
  axiosPut,
  axiosHeadSelf,
  axiosGetSelf,
  axiosPostSelf,
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

const restoreProjectApi = (id) => {
  return axiosPost(`/project/restore/${id}`);
};

const inactiveProjectApi = (id) => {
  return axiosDelete(`/project/inactive/${id}`);
};

const deleteProjectApi = (id) => {
  return axiosDelete(`/project/${id}`);
};


const shareProjectApi = (id, body) => {
  return axiosPost(`/project/share/${id}`, body);
};

const revokeSharedProjectApi = (id, body) => {
  return axiosPost(`/project/revoke/${id}`, body);
};

const updatePermissionApi = (id, body) => {
  return axiosPost(`/project/update/permission/${id}`, body);
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
