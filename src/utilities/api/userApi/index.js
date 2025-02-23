const { axiosGet, axiosPut } = require("..");

const getUsersApi = () => {
  return axiosGet(`/user`);
};

const updateUsernameApi = (body) => {
  return axiosPut(`/user/username`, body);
};

const checkOtherUserApi = (id, email) => {
  return axiosGet(`/user/check/${id}/${email}`);
};

const updateUserApi = (body) => {
  return axiosPut(`/user`, body);
};

export { getUsersApi, checkOtherUserApi, updateUsernameApi, updateUserApi };
