const {
  axiosPost,
  axiosGet,
  axiosHead,
  axiosPut,
  axiosPostSelf,
  axiosGetSelf,
} = require("..");

// const LoginApi = (body) => {
//   return axiosPost("/auth/login", body);
// };

const LoginApi = (body) => {
  return axiosPostSelf("api/auth/login", body);
};

const RegisterApi = (body) => {
  return axiosPost("/auth/signup", body);
};

const ForgotApi = (email) => {
  return axiosGet(`/auth/forgot/${email}`);
};

const VerifyApi = (token) => {
  return axiosGet(`/auth/verify/${token}`);
};

const LogoutApi = () => {
  return axiosGetSelf(`/api/auth/logout`);
};
// const LogoutApi = () => {
//   return axiosGet(`/auth/logout`);
// };

const UpdateApi = (body) => {
  return axiosPut(`/auth/update`, body);
};

const CheckEmailApi = (email) => {
  return axiosHead(`/auth/check/email/${email}`);
};

const CheckUsernameApi = (username) => {
  return axiosHead(`/auth/check/username/${username}`);
};

const ResetApi = (token, body) => {
  return axiosPost(`/auth/reset/${token}`, body);
};

const GoogleApi = (body) => {
  return axiosPostSelf(`/api/auth/google`, body);
};
// const GoogleApi = (body) => {
//   return axiosPost(`/auth/google`, body);
// };

export {
  LoginApi,
  RegisterApi,
  ForgotApi,
  VerifyApi,
  UpdateApi,
  CheckEmailApi,
  ResetApi,
  GoogleApi,
  LogoutApi,
  CheckUsernameApi,
};
