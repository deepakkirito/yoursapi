import { showNotification } from "@/components/common/notification";
import { CreatePopupContext } from "@/utilities/context/popup";
import { ThemeContext } from "@/utilities/context/theme";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid2,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import {
  checkProjectExistApi,
  createProjectApi,
} from "@/utilities/api/projectApi";
import { checkApiExistApi } from "@/utilities/api/apiApi";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import { Editor } from "@monaco-editor/react";
import style from "./style.module.scss";
import { InfoOutlined } from "@mui/icons-material";
import CustomInput from "@/components/common/customTextField";

const AddProject = ({
  getProject = () => {},
  project = "",
  projectId = "",
  handleCreateApi = () => {},
}) => {
  const { popup, setPopup } = useContext(CreatePopupContext);
  const { theme, settheme } = useContext(ThemeContext);
  const [validator, setValidator] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    projectName: "",
    apiName: "",
    data: `[\n    {\n        \"format\": \"Please code your data in this format\",\n        \"dummy\": \"value\"\n    },\n    {\n        \"ifNot\": \"then it will not be accepted\"\n    }\n]`,
  });
  const [projectValidator, setProjectValidator] = useState("");
  const [apiValidator, setApiValidator] = useState("");
  const [codeValidator, setCodeValidator] = useState([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    !project &&
      data.projectName &&
      checkProjectExistApi(data.projectName)
        .then((res) => {
          setProjectValidator({
            name: "projectName",
            msg: "Project name already exist",
          });
        })
        .catch((err) => {
          setProjectValidator("");
        });
    project &&
      data.apiName &&
      checkApiExistApi(projectId, data.apiName)
        .then((res) => {
          setApiValidator({
            name: "apiName",
            msg: "Api name already exist",
          });
        })
        .catch((err) => {
          setApiValidator("");
        });
  }, [data]);

  useEffect(() => {
    let result = [];
    !project && projectValidator && result.push(projectValidator);
    apiValidator && result.push(apiValidator);
    setValidator(result);
  }, [projectValidator, apiValidator]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setFocused(true);
        setLoading(true);
        let temp = [];
        if (!data.projectName) {
          temp.push({
            name: "projectName",
            msg: "Project name is required",
          });
        }
        if (!data.apiName) {
          temp.push({
            name: "apiName",
            msg: "Api name is required",
          });
        }
        if (temp.length) {
          setValidator(temp);
          setLoading(false);
        } else {
          try {
            const body = {
              projectName: data.projectName,
              apiName: data.apiName,
              data: JSON.parse(data.data),
            };
            project && handleCreateApi(data.apiName, data.data);
          } catch (err) {
            console.log(err);

            setLoading(false);
            showNotification({
              content: "Data is not in valid format",
              type: "error",
            });
          }
          !project &&
            createProjectApi(data)
              .then((res) => {
                showNotification({
                  content: res.data.message,
                });
                setLoading(false);
                setPopup({ ...popup, open: false });
                getProject();
                setValidator([]);
                setData({
                  projectName: "",
                  apiName: "",
                  data: "[]",
                });
              })
              .catch((err) => {
                if (err.response.status === 422) {
                  temp = err.response.data.errors?.map((item) => ({
                    name: item.path,
                    msg: item.msg,
                  }));
                  setValidator(temp);
                } else {
                  showNotification({
                    content: err.response.data.message,
                    type: "error",
                  });
                }
                setLoading(false);
              });
        }
      }}
      onChange={(event) => {
        setFocused(false);
        setValidator([]);
        const formElements = event.currentTarget.elements;
        setData({
          ...data,
          projectName: formElements.projectName.value,
          apiName: formElements.apiName.value,
        });
      }}
    >
      <Grid2 container spacing={2}>
        <Grid2 item size={{ xs: 12, md: 6 }}>
          <CustomInput
            focused={focused}
            formError={
              validator.filter((item) => item.name === "projectName")?.length
            }
            required
            fullWidth
            autoFocus
            formClassName="flex flex-col gap-2"
            type="text"
            name="projectName"
            formLabel="Project name"
            defaultValue={project}
            disabled={project}
            error={
              validator.filter((item) => item.name === "projectName")?.length
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountTreeRoundedIcon color="secondary" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              backgroundColor: "background.default",
            }}
          >
            {validator?.map((item, index) => {
              if (item.name === "projectName") {
                return (
                  <FormHelperText
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <InfoOutlined />
                    <Typography>{item.msg}</Typography>
                  </FormHelperText>
                );
              }
            })}
          </CustomInput>
        </Grid2>
        <Grid2 item size={{ xs: 12, md: 6 }}>
          <CustomInput
            focused={focused}
            formError={
              validator.filter((item) => item.name === "apiName")?.length
            }
            required
            fullWidth
            formClassName="flex flex-col gap-2"
            formLabel="Api name"
            error={validator.filter((item) => item.name === "apiName")?.length}
            type="text"
            name="apiName"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <ApiRoundedIcon color="secondary" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              backgroundColor: "background.default",
            }}
          >
            {validator?.map((item, index) => {
              if (item.name === "apiName") {
                return (
                  <FormHelperText
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <InfoOutlined />
                    <Typography>{item.msg}</Typography>
                  </FormHelperText>
                );
              }
            })}
          </CustomInput>
        </Grid2>
        <Grid2 item size={{ xs: 12 }}>
          <Box className="py-2">
            <Typography>
              Data <i>(optional)</i>
            </Typography>
          </Box>
          <Box
            sx={{
              borderRadius: "0.5rem",
              overflow: "hidden",
              backgroundColor: "background.default",
              padding: "0.5rem",
              border: "1px solid",
              borderColor: "background.invert",
            }}
          >
            <Editor
              height="40vh"
              theme={`vs-${theme}`}
              defaultLanguage="javascript"
              defaultValue={`[\n    {\n        \"format\": \"Please code your data in this format\",\n        \"dummy\": \"value\"\n    },\n    {\n        \"ifNot\": \"then it will not be accepted\"\n    }\n]`}
              // value={data.data}
              onChange={(value) => {
                setValidator([]);
                setData({ ...data, data: value });
              }}
              onValidate={(value) => setCodeValidator(value)}
            />
            {codeValidator.length ? (
              <FormHelperText
                error
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <InfoOutlined />
                <Typography>
                  Error in code: {codeValidator[0].message}
                </Typography>
              </FormHelperText>
            ) : (
              ""
            )}
            {validator?.map((item, index) => {
              if (item.name === "data") {
                return (
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
                    <Typography>{item.msg}</Typography>
                  </FormHelperText>
                );
              }
            })}
          </Box>
        </Grid2>
        <Grid2 item size={{ xs: 12 }} className="flex justify-center">
          <Button
            type="submit"
            variant="outlined"
            disabled={validator.length || codeValidator.length || loading}
            sx={{
              padding: "1rem 4rem",
              borderRadius: "2rem",
              fontSize: "1.2rem",
              fontWeight: "700",
              backgroundColor: "background.default",
            }}
            endIcon={loading && <CircularProgress size={24} />}
          >
            Create
          </Button>
        </Grid2>
      </Grid2>
    </form>
  );
};

export default AddProject;
