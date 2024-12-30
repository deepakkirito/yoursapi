import { ThemeContext } from "@/utilities/context/theme";
import { Editor } from "@monaco-editor/react";
import { InfoOutlined } from "@mui/icons-material";
import { Box, Button, FormHelperText, Typography } from "@mui/material";
import { useContext, useState } from "react";

const DataContent = ({
  data,
  setData,
  currentData,
  setLoading,
  handleUpdateApi = () => {},
}) => {
  const { theme } = useContext(ThemeContext);
  const [codeValidator, setCodeValidator] = useState([]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "35rem !important",
      }}
      className="flex flex-col gap-4 items-center"
    >
      <Box
        sx={{
          height: "inherit",
          width: "inherit",
        }}
      >
        <Box
          sx={{
            borderRadius: "0.5rem",
            overflow: "hidden",
            height: "inherit",
            width: "inherit",
            border: "3px solid",
            borderColor: "background.defaultSolid",
            height: codeValidator.length ? "95%" : "100%",
          }}
        >
          <Editor
            height="100%"
            width="100%"
            theme={`vs-${theme}`}
            defaultLanguage="javascript"
            defaultValue={data}
            // value={data}
            onChange={(value) => {
              setData(value);
            }}
            onValidate={(value) => setCodeValidator(value)}
          />
        </Box>
        {Boolean(codeValidator.length) &&
          codeValidator.map((error, index) => (
            <FormHelperText
              key={index}
              error
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <InfoOutlined />
              <Typography>{error.message}</Typography>
            </FormHelperText>
          ))}
      </Box>
      <Box className="flex gap-4 items-center">
        <Button
          variant="contained"
          onClick={handleUpdateApi}
          disabled={
            Boolean(codeValidator.length) || currentData.current === data
          }
        >
          Save
        </Button>
        <Button
          variant="contained"
          disabled={data === "[]"}
          onClick={() => {
            setLoading(true);
            setData("[]");
            setTimeout(() => {
              setLoading(false);
            }, 10);
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default DataContent;
