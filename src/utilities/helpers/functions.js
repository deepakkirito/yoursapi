import { showNotification } from "@/components/common/notification";

export const getDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", // 'short' for abbreviated month
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const catchError = (err) => {
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

export const scrollToTarget = (id) => {
  setTimeout(() => {
    if (typeof document !== "undefined") {
      const migrateClick = document.getElementById(id);
      if (migrateClick) {
        migrateClick.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, 500);
};
