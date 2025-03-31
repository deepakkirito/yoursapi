const {
  axiosHeadSelf,
  axiosGetSelf,
  axiosPostSelf,
  axiosPatchSelf,
  axiosDeleteSelf,
  axiosPutSelf,
} = require("..");

export const checkProjectExistApi = (projectName) => {
  return axiosHeadSelf(`project/check/${projectName}`);
};

export const checkOwnerProjectExistApi = (projectName, projectId) => {
  return axiosHeadSelf(`project/check/${projectName}/${projectId}`);
};

export const checkProjectExistAllApi = (projectName, projectId) => {
  return axiosHeadSelf(`project/check/${projectName}/${projectId}`);
};

export const getProjectApi = (pagination, search, filter, sort) => {
  return axiosGetSelf(
    `project?page=${pagination.page}&rows=${pagination.rowsPerPage}${search ? `&search=${search}` : ""}${filter ? `&filter=${filter}&sort=${sort}` : ""}`
  );
};

export const getInactiveProjectApi = (pagination, search, filter, sort) => {
  return axiosGetSelf(
    `project/inactive?page=${pagination.page}&rows=${pagination.rowsPerPage}${search ? `&search=${search}` : ""}${filter ? `&filter=${filter}&sort=${sort}` : ""}`
  );
};

export const getSharedProjectApi = (pagination, search, filter, sort) => {
  return axiosGetSelf(
    `project/share?page=${pagination.page}&rows=${pagination.rowsPerPage}${search ? `&search=${search}` : ""}${filter ? `&filter=${filter}&sort=${sort}` : ""}`
  );
};

export const getSingleProjectApi = async (id) => {
  return await axiosGetSelf(`project/${id}`);
};

export const getSingleShareProjectAccessApi = (id) => {
  return axiosGetSelf(`project/access/${id}`);
};

export const createProjectApi = (body) => {
  return axiosPostSelf(`project`, body);
};

export const updatePermissionApi = (id, body) => {
  return axiosPatchSelf(`project/access/${id}`, body);
};

export const checkOtherUserApi = (id, email) => {
  return axiosGetSelf(`project/access/${id}/${email}`);
};

export const shareProjectApi = (id, body) => {
  return axiosPostSelf(`project/access/${id}`, body);
};

export const revokeSharedProjectApi = (id, body) => {
  return axiosPutSelf(`project/access/${id}`, body);
};

export const restoreProjectApi = (id) => {
  return axiosPutSelf(`project/${id}`);
};

export const inactiveProjectApi = (id) => {
  return axiosDeleteSelf(`project/${id}?soft=true`);
};

export const deleteProjectApi = (id) => {
  return axiosDeleteSelf(`project/${id}?soft=false`);
};

export const updateProjectNameApi = (id, body) => {
  return axiosPatchSelf(`project/${id}`, body);
};

export const updateSharedProjectNameApi = (id, body) => {
  return axiosPatchSelf(`project/${id}`, body);
};

export const getProjectDatabaseApi = (id) => {
  return axiosGetSelf(`project/database/${id}`);
};

export const saveProjectDatabaseApi = (id, body) => {
  return axiosPostSelf(`project/database/${id}`, body);
};

export const updateProjectDatabaseApi = (id, body) => {
  return axiosPatchSelf(`project/database/${id}`, body);
};

export const deleteProjectDatabaseApi = (id) => {
  return axiosDeleteSelf(`project/database/${id}`);
};

export const getProjectInstanceApi = (id) => {
  return axiosGetSelf(`project/instance/${id}`);
};

export const updateProjectInstanceApi = (id, body) => {
  return axiosPatchSelf(`project/instance/${id}`, body);
};

export const startProjectInstanceApi = (id) => {
  return axiosPostSelf(`project/instance/${id}`);
};

export const stopProjectInstanceApi = (id) => {
  return axiosDeleteSelf(`project/instance/${id}`);
};
