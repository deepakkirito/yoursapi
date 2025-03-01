const { axiosGet, axiosPost, axiosPut, axiosDelete, axiosGetSelf } = require("..");

const getCustomDataApi = (query) => {
  return axiosGetSelf(`customdata${query ? `?${query}` : ""}`);
};

const postCustomDataApi = (id, body) => {
  return axiosPost("/customdata/" + id, body);
};

export { getCustomDataApi, postCustomDataApi };
