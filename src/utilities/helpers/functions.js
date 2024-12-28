import { showNotification } from "@/components/common/notification";

const getDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", // 'short' for abbreviated month
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const catchError = (err) => {
  console.log(err);
  if (err.response?.status === 403) return;
  if (err.response?.status === 422) {
    err.response.data.errors.forEach((item) => {
      showNotification({
        content: item.msg,
        type: "error",
      });
    });
  } else {
    showNotification({
      content:
        err.response?.error?.message ||
        err.response?.data?.message ||
        "Something went wrong",
      type: "error",
    });
  }
};

export { getDate, catchError };
