const { axiosGet, axiosPost, axiosPut, axiosDelete } = require("..");

const getCustomDataApi = (query) => {
  return axiosGet(`/customdata${query ? `?${query}` : ""}`);
};

const postCustomDataApi = (id, body) => {
  return axiosPost("/customdata/" + id, body);
};

export { getCustomDataApi, postCustomDataApi };
