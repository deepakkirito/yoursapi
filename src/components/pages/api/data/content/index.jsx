import { showNotification } from "@/components/common/notification";
import { getApiDetailsApi, updateApiDataApi } from "@/utilities/api/apiApi";
import { ThemeContext } from "@/utilities/context/theme";
import { catchError } from "@/utilities/helpers/functions";
import { Editor } from "@monaco-editor/react";
import { InfoOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const DataContent = ({ open, setOpen }) => {
  const searchparams = useSearchParams();
  const { theme, settheme } = useContext(ThemeContext);
  const [data, setData] = useState("");
  const [codeValidator, setCodeValidator] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = searchparams.get("api");
  const id = searchparams.get("id");
  const router = useRouter();
  const currentData = useRef("");

  useEffect(() => {
    id && getApiDetails(id);
  }, [id]);

  const getApiDetails = async (id) => {
    setLoading(true);
    await getApiDetailsApi(id)
      .then((response) => {
        setData(
          JSON.stringify(response.data, null, 4)
            .replace(/"/g, '"') // Escape double quotes
            .replace(/\\n/g, "\n")
        );
        currentData.current = JSON.stringify(response.data, null, 4)
          .replace(/"/g, '"') // Escape double quotes
          .replace(/\\n/g, "\n");
      })
      .catch((error) => {
        catchError(error);
        window.location.href = "/projects";
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateApi = async () => {
    setLoading(true);
    if (data !== "[]") {
      try {
        JSON.parse(data);
      } catch (error) {
        setLoading(false);
        showNotification({
          content: "Data is not in valid format",
          type: "error",
        });
        return;
      }
    }

    const body = {
      data: data,
    };
    await updateApiDataApi(id, body)
      .then((response) => {
        showNotification({
          content: "Data updated successfully",
          type: "success",
        });
        getApiDetails(id);
      })
      .catch((error) => {
        catchError(error);
        setLoading(false);
      });
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: {
          lg: "100%",
          xs: "30rem !important",
        }
      }}
      className="flex flex-col gap-4 items-center"
    >
      <Box sx={{
        height: "inherit",
        width: "inherit",
      }}>
        {loading ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress color="secondary" size={24} />
          </Box>
        ) : (
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
        )}
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
      {!loading && (
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
            disabled={loading || data === "[]"}
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
      )}
    </Box>
  );
};

export default DataContent;
