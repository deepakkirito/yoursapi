import { Box, Typography } from "@mui/material";

const Notification = ({ title = "", content = "" }) => {
  return (
    <Box>
      {title && <Typography variant="h4">{title}</Typography>}
      <Typography>{content}</Typography>
    </Box>
  );
};

export default Notification;
