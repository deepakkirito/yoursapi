const {
  axiosGet,
  axiosPost,
  axiosPut,
  axiosDelete,
  axiosGetSelf,
  axiosPostSelf,
  axiosDeleteSelf,
} = require("..");

const getDatabaseInfoApi = () => {
  return axiosGetSelf(`database`);
};

const getMigrateDataApi = (option) => {
  return axiosGetSelf(`database/${option}`);
};

const postMigrateDataApi = (option, body) => {
  return axiosPostSelf(`/database/${option}`, body);
};

const saveDBStringApi = (body) => {
  return axiosPostSelf(`database`, body);
};

export const deleteDBStringApi = () => {
  return axiosDeleteSelf(`database`);
};

export {
  saveDBStringApi,
  getDatabaseInfoApi,
  getMigrateDataApi,
  postMigrateDataApi,
};
