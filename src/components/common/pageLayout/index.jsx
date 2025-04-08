import { Box } from "@mui/material";

const PageLayout = ({ navContent, children }) => {
  return (
    <Box
      sx={{
        height: "calc(100vh - 4.7rem)",
        border: "0.2rem solid",
        borderTop: "0.1rem solid",
        borderLeft: "0.1rem solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          padding: "1rem 1rem",
          backgroundColor: "background.foreground",
          borderBottom: "0.1rem solid",
          borderColor: "divider",
        }}
      >
        {navContent}
      </Box>
      <Box
        sx={{
          padding: "0.5rem",
          height: "inherit",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout;
