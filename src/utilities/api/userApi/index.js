const { axiosGet, axiosPut, axiosGetSelf, axiosPatchSelf } = require("..");

const getUsersApi = () => {
  return axiosGetSelf(`/user`);
};

const updateUsernameApi = (body) => {
  return axiosPatchSelf(`/user`, body);
};

const checkOtherUserApi = (id, email) => {
  return axiosGetSelf(`user/check/${id}/${email}`);
};

const updateUserApi = (body) => {
  return axiosPatchSelf(`/user`, body);
};

export { getUsersApi, checkOtherUserApi, updateUsernameApi, updateUserApi };
