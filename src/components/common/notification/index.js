const { default: Notification } = require("./notification");
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import {
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
  ReportProblemOutlined,
} from "@mui/icons-material";

const showNotification = ({
  duration = 5000,
  position = "top-right",
  title,
  content,
  type = "success",
}) => {
  const toastStyles = {
    base: {
      backgroundColor: "#1E1E2F", // Dark theme with a premium feel
      color: "#EDEDED",
      borderRadius: "12px",
      padding: "14px 16px",
      boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.25)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      display: "flex",
      alignItems: "center",
      fontSize: "16px",
      fontWeight: "500",
    },
    success: {
      backgroundColor: "#2ECC71", // Vibrant green
      color: "#FFFFFF",
      borderLeft: "5px solid #27AE60",
      icon: (
        <CheckCircleOutline
          style={{ color: "#FFFFFF", fontSize: "20px", marginRight: "10px" }}
        />
      ),
    },
    error: {
      backgroundColor: "#E74C3C", // Premium red
      color: "#FFFFFF",
      borderLeft: "5px solid #C0392B",
      icon: (
        <ErrorOutline
          style={{ color: "#FFFFFF", fontSize: "20px", marginRight: "10px" }}
        />
      ),
    },
    info: {
      backgroundColor: "#3498DB", // Elegant blue
      color: "#FFFFFF",
      borderLeft: "5px solid #2980B9",
      icon: (
        <InfoOutlined
          style={{ color: "#FFFFFF", fontSize: "20px", marginRight: "10px" }}
        />
      ),
    },
    warning: {
      backgroundColor: "#F1C40F", // Premium yellow
      color: "#212121",
      borderLeft: "5px solid #D4AC0D",
      icon: (
        <ReportProblemOutlined
          style={{ color: "#212121", fontSize: "20px", marginRight: "10px" }}
        />
      ),
    },
  };
  toast[type](<Notification title={title} content={content} />, {
    style: { ...toastStyles.base, ...toastStyles[type] },
    autoClose: duration,
    autoClose: duration,
    closeButton: true,
    position: position,
  });
};

export { showNotification };
