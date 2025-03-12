import { showNotification } from "@/components/common/notification";
// import JSON5 from "json5";
import moment from "moment-timezone";

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

export const getUniqueValues = (arr, key) => {
  return [...new Set(arr.map((item) => item[key]))];
};

export const getUniqueValuesFromObject = (arr, key) => {
  return [...new Set(arr.map((item) => item[key]))];
};

export const getDataToString = (data) => {
  return JSON.stringify(data, null, 4)
    .replace(/\\n/g, "\n") // Replace escaped newlines with actual newline characters
    .replace(/\\"/g, '"') // Replace escaped quotes with actual quotes
    .replace(/\\\\/g, "\\"); // Escape backslashes if needed
};

export const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const isValidJson = (str) => {
  if (typeof str !== "string") return { valid: true, content: str };

  // try {
  //   const parsed = JSON5.parse(str);
  //   return { valid: true, content: parsed };
  // } catch (e) {
  // console.log("Parsing failed:", e.message);
  try {
    const parsed = JSON.parse(str);
    return { valid: true, content: parsed };
  } catch (e) {
    return { valid: false, content: str };
  }
  // }
};

// Function to convert any date to IST
export const convertToIST = (date) => {
  return moment(date).tz("Asia/Kolkata").toDate();
};
