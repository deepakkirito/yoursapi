import { ThemeContext } from "@/utilities/context/theme";
import {
  catchError,
  getDataToString,
  getRandomColor,
  isValidJson,
} from "@/utilities/helpers/functions";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import { Editor } from "@monaco-editor/react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { useContext, useMemo, useState } from "react";
import Logo from "@/app/favicon.svg";
import streamingText from "../streamingText";
import StreamingText from "../streamingText";
import { ContentCopyRounded } from "@mui/icons-material";
import { showNotification } from "../notification";
import json5 from "json5";
import CustomInput from "../customTextField";
import TooltipCustom from "../tooltip";
import { colorOptions } from "@/components/assets/constants/color";
import { postCustomDataApi } from "@/utilities/api/customDataApi";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateAlertContext } from "@/utilities/context/alert";
import useCustomWindow from "@/utilities/helpers/hooks/window";
const aiImage =
  "https://cdn.glitch.global/1451944e-7aa5-4b35-8561-bbbd6e79fae9/happy-hacker.gif?v=1682951858146";

const CustomTypography = ({ children }) => {
  return (
    <Typography
      variant="h7"
      className="text-break"
      color="text.primary"
      sx={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      {children}
    </Typography>
  );
};

const CustomAiResponse = ({ messages, loading, data }) => {
  const [profile, setProfile] = useLocalStorage("profile");

  return (
    <Box className="flex flex-col gap-4 items-center py-4 w-full">
      {messages?.length > 0 &&
        messages.map((message, index) => (
          <Box
            key={index}
            id={`message-${index}`}
            className="flex gap-2 items-start w-full"
            sx={{
              flexDirection: message.role === "user" ? "row-reverse" : "row",
            }}
          >
            <Avatar
              sx={{
                // bgcolor: getRandomColor(),
                color: "text.primary",
                width: message.role === "user" ? "2.5rem" : "4rem",
                height: message.role === "user" ? "2.5rem" : "4rem",
              }}
              src={message.role === "user" ? profile : aiImage}
            />
            <Box
              sx={{
                borderRadius: "1rem",
                padding: "0 0.5rem",
                backgroundColor: "background.defaultSolid",
                border: "2px solid",
                borderColor: "divider",
                minWidth: "0%",
                maxWidth: "80%",
              }}
            >
              <RenderMessages
                message={isValidJson(message.content)}
                data={data}
              />
            </Box>
          </Box>
        ))}
      {/* {loading && <CircularProgress id="loading" size={24} color="secondary" />} */}
      {loading && (
        <Box id="loading" className="flex gap-2 items-start w-full">
          <Avatar
            sx={{
              // bgcolor: getRandomColor(),
              color: "text.primary",
              marginTop: "0.2rem",
            }}
            src={aiImage}
          />
          <Box
            className="flex flex-col gap-2 items-center justify-center"
            sx={{
              borderRadius: "1rem",
              padding: "0.5rem",
              backgroundColor: "background.defaultSolid",
              border: "2px solid",
              borderColor: "divider",
              minWidth: "0%",
              maxWidth: "80%",
            }}
          >
            <Box>
              <Avatar
                sx={{
                  // bgcolor: getRandomColor(),
                  color: "text.primary",
                  marginTop: "0.2rem",
                  width: "15rem",
                  height: "10rem",
                }}
                src={aiImage}
              />
            </Box>
            <StreamingText text="okay!!!, I am thinking..." speed={150} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CustomAiResponse;

const RenderMessages = ({ message }) => {
  const searchparams = useSearchParams();
  const { theme } = useContext(ThemeContext);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();
  const { alert, setAlert } = useContext(CreateAlertContext);
  const apiId = searchparams.get("id");
  const window = useCustomWindow();

  const handleUpdateData = async (option, data) => {
    const body = {
      data: data,
      option: option,
    };
    setUpdateLoading(true);
    await postCustomDataApi(apiId, body)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        window.location.reload();
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  const renderEditor = (item, index, type) => {
    return (
      <Box
        className="flex gap-2 items-start flex-col w-full rounded-lg overflow-hidden"
        key={index}
      >
        {/* <Editor
          height="300px"
          width="100%"
          theme={`vs-${theme}`}
          defaultLanguage="javascript"
          defaultValue={getDataToString(item.content)}
          options={{
            readOnly: true,
          }}
        /> */}
        <CustomInput
          label={item.type}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <TooltipCustom title="Copy to clipboard" placement="top">
                <InputAdornment
                  position="top-end"
                  sx={{
                    position: "absolute",
                    top: "0rem",
                    right: "0rem",
                    cursor: "pointer",
                    opacity: 0,
                    transition: "all 0.8s",
                    backgroundColor: "background.defaultSolid",
                    borderRadius: "2rem",
                    padding: "1.2rem 0.5rem ",
                    border: "2px solid",
                    borderColor: "divider",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      getDataToString(item.content)
                    );
                    showNotification({
                      content: "Code copied",
                    });
                  }}
                >
                  <ContentCopyRounded color="secondary" />
                </InputAdornment>
              </TooltipCustom>
            ),
          }}
          size="small"
          value={getDataToString(item.content)}
          multiline={true}
          formSX={{
            "& .MuiInputBase-root": {
              backgroundColor: colorOptions.blackPremium,
              padding: "1rem",
              color: "#F5F4EB",
            },
            ":hover": {
              "& .MuiInputAdornment-root": {
                opacity: 1,
                right: "0.5rem",
                top: "0.5rem",
              },
            },
          }}
        />
        {type && (
          <Box className="flex gap-4 items-center justify-center w-full my-2">
            <Button
              variant="contained"
              size="small"
              endIcon={
                updateLoading && <CircularProgress size={16} color="loading" />
              }
              onClick={() => {
                setAlert({
                  open: true,
                  title: "Are you Sure?",
                  content: (
                    <Box className="flex flex-col gap-2">
                      <Typography>
                        - Custom data will be merged with the existing data.
                      </Typography>
                      {schema !== null && (
                        <Typography>
                          - This api have a schema set, this data may not get
                          saved if custom data doesn&apos;t matches the schema.
                        </Typography>
                      )}
                    </Box>
                  ),
                  handleClose: () => {
                    setAlert({ ...alert, open: false });
                  },
                  handleSuccess: () => {
                    handleUpdateData("merge", item.content);
                    setAlert({ ...alert, open: false });
                  },
                });
              }}
            >
              Merge
            </Button>
            <Button
              variant="contained"
              size="small"
              endIcon={
                updateLoading && <CircularProgress size={16} color="loading" />
              }
              onClick={() => {
                setAlert({
                  open: true,
                  title: "Are you Sure?",
                  content: (
                    <Box className="flex flex-col gap-2">
                      <Typography>
                        - Custom data will be replaced with the existing data.
                      </Typography>
                      {schema !== null && (
                        <Typography>
                          - This api have a schema set, this data may not get
                          saved if custom data doesn&apos;t matches the schema.
                        </Typography>
                      )}
                    </Box>
                  ),
                  handleClose: () => {
                    setAlert({ ...alert, open: false });
                  },
                  handleSuccess: () => {
                    handleUpdateData("replace", item.content);
                    setAlert({ ...alert, open: false });
                  },
                });
              }}
            >
              Replace
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const messageType = useMemo(() => {
    if (!message.valid) {
      return <CustomTypography>{message.content}</CustomTypography>;
    } else {
      if (
        typeof message.content === "string" ||
        typeof message.content === "number"
      ) {
        return <CustomTypography>{message.content}</CustomTypography>;
      }
      return (
        <Box className="flex gap-2 items-start flex-col">
          {message?.content?.length > 0 &&
            message?.content?.map((item, index) => {
              switch (item.type) {
                case "text":
                  return <CustomTypography>{item.content}</CustomTypography>;
                case "object":
                  return renderEditor(item, index, "");

                case "array":
                  return renderEditor(item, index, "array");

                case "objectArray":
                  return renderEditor(item, index, "objectArray");

                case "json":
                  return renderEditor(item, index, "json");

                case "jsonArray":
                  return renderEditor(item, index, "jsonArray");

                case "code":
                  return renderEditor(item, index);

                case "html":
                  return (
                    <Box className="flex gap-2 items-center w-full" key={index}>
                      <Box className="flex gap-2 items-start flex-col w-full">
                        <Typography
                          component={"iframe"}
                          srcDoc={item.content}
                          sx={{
                            minWidth: "30rem",
                            maxWidth: "40rem",
                            height: "30rem",
                            // overflow: "auto",
                            borderRadius: "0.5rem",
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          navigator.clipboard.writeText(item.content);
                          showNotification({
                            content: "Html copied",
                          });
                        }}
                      >
                        <ContentCopyRounded />
                      </IconButton>
                    </Box>
                  );

                default:
                  break;
              }
            })}
        </Box>
      );
    }
  }, [message]);

  return (
    <Box
      className="p-2 w-full overflow-hidden user"
      sx={{
        userSelect: "text",
      }}
    >
      {messageType}
    </Box>
  );
};
