const { axiosPatchSelf, axiosPostSelf, axiosGetSelf } = require("..");

export const getPermissionApi = async (id) => {
    return axiosGetSelf(`permission/${id}`);
};

export const createPermissionApi = async (id, body) => {
    return axiosPostSelf(`permission/${id}`, body);
};

export const updatePermissionApi = async (id, body) => {
    return axiosPatchSelf(`permission/${id}`, body);
};