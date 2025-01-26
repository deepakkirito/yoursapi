const { axiosGet, axiosPost, axiosPut, axiosDelete } = require("..");

const postExampleAiApi = (body) => {
  return axiosPost("/ai/example", body);
};

const postDataAiApi = (body) => {
  return axiosPost("/ai/data", body);
};

export { postDataAiApi, postExampleAiApi };
