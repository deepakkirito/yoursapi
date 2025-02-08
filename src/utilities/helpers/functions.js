import { showNotification } from "@/components/common/notification";
import json5 from "json5";

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

// export const isValidJson = (str) => {
//   console.log("Input:", str);

//   if (typeof str !== "string") return { valid: true, content: str };

//   try {
//     // Step 1: Directly parse the JSON string
//     const parsed = JSON.parse(str);
//     return { valid: true, content: parsed };
//   } catch (e) {
//     console.log("Initial JSON parsing failed. Attempting cleanup...");

//     let cleanedStr = str;

//     try {
//       // Step 2: Remove comments
//       cleanedStr = cleanedStr.replace(/\/\/.*$/gm, "");

//       // Step 3: Fix unescaped quotes around dates and other fields
//       cleanedStr = cleanedStr.replace(
//         /"createdAt":\s*"(.*?)"-"(.*?):"(.*?)":(.*?)"/g,
//         (_, part1, part2, part3, part4) => {
//           return `"createdAt": "${part1}-${part2}T${part3}:${part4}"`;
//         }
//       );

//       // Step 4: Ensure all keys are properly quoted
//       cleanedStr = cleanedStr.replace(/(\w+):/g, '"$1":');

//       // Step 5: Escape newlines inside string values
//       cleanedStr = cleanedStr.replace(/(\r\n|\n|\r)/g, "\\n");

//       // Step 6: Remove trailing commas
//       cleanedStr = cleanedStr.replace(/,(\s*[}\]])/g, "$1");

//       console.log("Cleaned String:", cleanedStr);

//       // Step 7: Parse the cleaned string
//       const parsed = JSON.parse(cleanedStr);
//       return { valid: true, content: parsed };
//     } catch (cleanupError) {
//       console.error("Cleanup and parsing failed:", cleanupError.message);
//       return { valid: false, content: cleanedStr };
//     }
//   }
// };

export const isValidJson = (str) => {
  if (typeof str !== "string") return { valid: true, content: str };

  try {
    const parsed = json5.parse(str);
    return { valid: true, content: parsed };
  } catch (e) {
    console.error("Parsing failed:", e.message);
    try {
      const parsed = JSON.parse(str);
      return { valid: true, content: parsed };
    } catch (e) {
      return { valid: false, content: str };
    }
  }
};
