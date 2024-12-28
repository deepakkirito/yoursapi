const { axiosGet, axiosPost, axiosPut, axiosDelete } = require("..");

const getDatabaseInfoApi = () => {
  return axiosGet(`/database`);
};

const getMigrateDataApi = (option) => {
  return axiosGet(`/database/migrate/${option}`);
};

const postMigrateDataApi = (option, body) => {
  return axiosPost(`/database/migrate/${option}`, body);
};

const saveDBStringApi = (body) => {
  return axiosPost(`/database/save`, body);
};

export {
  saveDBStringApi,
  getDatabaseInfoApi,
  getMigrateDataApi,
  postMigrateDataApi,
};
