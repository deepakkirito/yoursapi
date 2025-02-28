const { axiosGet, axiosPut, axiosGetSelf, axiosPatchSelf } = require("..");

const getUsersApi = () => {
  return axiosGetSelf(`/user`);
};

const updateUsernameApi = (body) => {
  return axiosPatchSelf(`/user`, body);
};

const updateUserApi = (body) => {
  return axiosPatchSelf(`/user`, body);
};

export { getUsersApi, updateUsernameApi, updateUserApi };
