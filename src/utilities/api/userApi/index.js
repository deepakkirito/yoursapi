const { axiosGet, axiosPut } = require("..");

const getUsersApi = () => {
  return axiosGet(`/user`);
};

const updateUserApi = (body) => {
  return axiosPut(`/user/username`, body);
};

const checkOtherUserApi = (id, email) => {
  return axiosGet(`/user/check/${id}/${email}`);
};

export { getUsersApi, checkOtherUserApi, updateUserApi };
