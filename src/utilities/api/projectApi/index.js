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

export const getSingleProjectApi = async (id, environment) => {
  return await axiosGetSelf(`project/${id}?environment=${environment}`);
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

export const startProjectInstanceApi = (id, environment) => {
  return axiosPostSelf(`project/instance/${id}?environment=${environment}`);
};

export const stopProjectInstanceApi = (id, environment) => {
  return axiosDeleteSelf(`project/instance/${id}?environment=${environment}`);
};

export const addSubscriptionApi = (id, body) => {
  return axiosPostSelf(`project/subscription/${id}`, body);
};

export const getProjectMetricsApi = (id, environment) => {
  return axiosGetSelf(
    `project/instance/metrics/${id}?environment=${environment}`
  );
};

export const getProjectLogsApi = (id, environment) => {
  return axiosGetSelf(`project/instance/logs/${id}?environment=${environment}`);
};

export const getProjectTotalLogsApi = ({
  id,
  environment,
  search,
  filter,
  rows,
  page,
  order,
  orderBy,
  logType,
}) => {
  return axiosGetSelf(
    `project/logs/${id}?environment=${environment}&search=${search}&filter=${filter}&rows=${rows}&page=${page}&order=${order}&orderBy=${orderBy}&logType=${logType}`
  );
};

export const checkDomainExistApi = ({ id, domain }) => {
  return axiosHeadSelf(`project/domain/${id}?domain=${domain}`);
};

export const addDomainApi = ({ id, body }) => {
  return axiosPostSelf(`project/domain/${id}`, body);
};

export const removeDomainApi = ({ id, domain, environment }) => {
  return axiosDeleteSelf(
    `project/domain/${id}?domain=${domain}&environment=${environment}`
  );
};
