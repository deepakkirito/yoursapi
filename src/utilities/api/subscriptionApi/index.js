const {
  axiosGetSelf,
  axiosPostSelf,
  axiosPatchSelf,
  axiosDeleteSelf,
} = require("..");

export const getSubscriptionApi = async (
  page,
  rowsPerPage,
  search,
  sort,
  filter
) => {
  return axiosGetSelf(
    `subscription?page=${page}&rowsPerPage=${rowsPerPage}&search=${search}&sort=${sort}&filter=${filter}`
  );
};

export const getSingleSubscriptionApi = async (id) => {
  return axiosGetSelf(`subscription/${id}`);
};

export const createSubscriptionApi = async (body) => {
  return axiosPostSelf(`subscription`, body);
};

export const updateSubscriptionApi = async (id, body) => {
  return axiosPatchSelf(`subscription/${id}`, body);
};

export const deleteSubscriptionApi = async (id) => {
  return axiosDeleteSelf(`subscription/${id}`);
};
