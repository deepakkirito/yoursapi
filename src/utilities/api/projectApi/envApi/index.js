import {
  axiosDeleteSelf,
  axiosGetSelf,
  axiosPatchSelf,
  axiosPostSelf,
} from "../..";

export const getProjectEnvironmentApi = ({ id, environment, envId }) => {
  return axiosGetSelf(
    `project/env/${id}?environment=${environment}&id=${envId}`
  );
};

export const addProjectEnvironmentApi = ({ id, body, environment }) => {
  return axiosPostSelf(`project/env/${id}?environment=${environment}`, body);
};

export const updateProjectEnvironmentApi = ({
  id,
  body,
  envId,
  environment,
}) => {
  return axiosPatchSelf(
    `project/env/${id}?environment=${environment}&id=${envId}`,
    body
  );
};

export const deleteProjectEnvironmentApi = ({ id, environment, envId }) => {
  return axiosDeleteSelf(
    `project/env/${id}?environment=${environment}&id=${envId}`
  );
};
