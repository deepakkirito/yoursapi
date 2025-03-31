import { Box } from "@mui/material";

const PageLayout = ({ navContent, children }) => {
  return (
    <Box
      sx={{
        height: "100%",
        // width: "100%",
        backgroundColor: "background.foreground",
        border: "2px solid",
        borderColor: "background.default",
        borderRadius: "1rem",
        margin: "0 0.5rem",
      }}
    >
      <Box
        sx={{
          padding: "1rem",
          backgroundColor: "background.foreground",
          borderBottom: "2px solid",
          borderColor: "background.default",
          borderRadius: "1rem 1rem 0 0",
        }}
      >
        {navContent}
      </Box>
      <Box
        sx={{
          padding: "0.5rem",
          height: "calc(100vh - 11.5rem)",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout;
