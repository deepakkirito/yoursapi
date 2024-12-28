const { default: Notification } = require("./notification");
import { toast } from "react-toastify";

const showNotification = ({
  duration = 5000,
  position = "top-right",
  title,
  content,
  type = "success",
}) => {
  toast[type](<Notification title={title} content={content} />, {
    className: "toast-message",
    autoClose: duration,
    closeButton: true,
    position: position,
  });
};

export { showNotification };
