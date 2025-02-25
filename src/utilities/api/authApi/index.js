const { axiosPostSelf, axiosGetSelf, axiosHeadSelf } = require("..");

const LoginApi = (body) => {
  return axiosPostSelf("auth/login", body);
};

const RegisterApi = (body) => {
  return axiosPostSelf("auth/signup", body);
};

const ForgotApi = (email) => {
  return axiosPostSelf(`auth/forgot`, { email });
};

const VerifyApi = (token) => {
  return axiosGetSelf(`auth/verify/${token}`);
};

const LogoutApi = () => {
  return axiosGetSelf(`auth/logout`);
};

const GoogleApi = (body) => {
  return axiosPostSelf(`auth/google`, body);
};

const ResetApi = (token, body) => {
  return axiosPostSelf(`auth/forgot/${token}`, body);
};

const CheckEmailApi = (email) => {
  return axiosHeadSelf(`auth/email/${email}`);
};

const CheckUsernameApi = (username) => {
  return axiosHeadSelf(`auth/username/${username}`);
};

export {
  LoginApi,
  RegisterApi,
  ForgotApi,
  VerifyApi,
  CheckEmailApi,
  ResetApi,
  GoogleApi,
  LogoutApi,
  CheckUsernameApi,
};
