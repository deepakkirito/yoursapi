import { CreateAlertContext } from "@/utilities/context/alert";
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
  const { alert, setAlert } = useContext(CreateAlertContext);

  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 18rem) !important",
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
          size="small"
          onClick={() => {
            setAlert({
              open: true,
              title: "Are you Sure?",
              content:
                "Updating the data here will apply the schema to all the data, we suggest you to copy the data before updating to prevent any loss of data.",
              handleClose: () => {
                setAlert({ ...alert, open: false });
              },
              handleSuccess: () => {
                handleUpdateApi();
                setAlert({ ...alert, open: false });
              },
            });
          }}
          disabled={
            Boolean(codeValidator.length) || currentData.current === data
          }
        >
          Save
        </Button>
        <Button
          variant="contained"
          size="small"
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
