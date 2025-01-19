const { axiosGet, axiosPost, axiosPut, axiosDelete } = require("..");

const getCustomDataApi = (query) => {
  return axiosGet(`/customdata${query ? `?${query}` : ""}`);
};

export { getCustomDataApi };
