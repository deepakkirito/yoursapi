const { default: axios } = require("axios");

const axiosGet = (url) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403) {
          localStorage.removeItem("login");
          localStorage.removeItem("user");
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

const axiosPost = (url, body) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, body, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403) {
          localStorage.removeItem("login");
          localStorage.removeItem("user");
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

const axiosPut = (url, body) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .put(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, body, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403) {
          localStorage.removeItem("login");
          localStorage.removeItem("user");
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

const axiosDelete = (url) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403) {
          localStorage.removeItem("login");
          localStorage.removeItem("user");
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

const axiosHead = (url) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .head(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => reject(err));
  });
  return promise;
};

export { axiosGet, axiosPost, axiosPut, axiosDelete, axiosHead };
