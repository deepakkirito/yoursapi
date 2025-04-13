const { default: axios } = require("axios");

const axiosGet = (url) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}/api2`, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403) {
          localStorage.clear();
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

const axiosGetSelf = (url) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .get(`${process.env.NEXT_PUBLIC_COMPANY_URL}api/${url}`, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403 || err.status === 401) {
          localStorage.clear();
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
      .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}/api2`, body, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403) {
          localStorage.clear();
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

const axiosPostSelf = (url, body) => {
  let promise = new Promise(function (resolve, reject) {
    console.log({ url });

    axios
      .post(`${process.env.NEXT_PUBLIC_COMPANY_URL}api/${url}`, body, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403 || err.status === 401) {
          localStorage.clear();
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
      .put(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}/api2`, body, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403 || err.status === 401) {
          localStorage.clear();
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

const axiosPutSelf = (url, body) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .put(`${process.env.NEXT_PUBLIC_COMPANY_URL}api/${url}`, body, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403 || err.status === 401) {
          localStorage.clear();
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
      .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}/api2`, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403 || err.status === 401) {
          localStorage.clear();
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

const axiosDeleteSelf = (url) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .delete(`${process.env.NEXT_PUBLIC_COMPANY_URL}api/${url}`, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403 || err.status === 401) {
          localStorage.clear();
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
      .head(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}/api2`, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => reject(err));
  });
  return promise;
};

const axiosHeadSelf = (url) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .head(`${process.env.NEXT_PUBLIC_COMPANY_URL}api/${url}`, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403 || err.status === 401) {
          localStorage.clear();
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

const axiosPatchSelf = (url, body) => {
  let promise = new Promise(function (resolve, reject) {
    axios
      .patch(`${process.env.NEXT_PUBLIC_COMPANY_URL}api/${url}`, body, {
        withCredentials: true,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.status === 403 || err.status === 401) {
          localStorage.clear();
          window.location.pathname = "/login";
        }
        reject(err);
      });
  });
  return promise;
};

export {
  axiosGet,
  axiosPost,
  axiosPut,
  axiosDelete,
  axiosHead,
  axiosPostSelf,
  axiosGetSelf,
  axiosPutSelf,
  axiosDeleteSelf,
  axiosHeadSelf,
  axiosPatchSelf,
};
