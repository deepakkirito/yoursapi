const { axiosGet, axiosPost, axiosPut, axiosDelete } = require("..");

const postDataAiApi = (body) => {
  return axiosPost("/ai/data", body);
};

export { postDataAiApi };
