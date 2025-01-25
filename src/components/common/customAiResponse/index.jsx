import { ThemeContext } from "@/utilities/context/theme";
import {
  getDataToString,
  getRandomColor,
  isValidJson,
} from "@/utilities/helpers/functions";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import { Editor } from "@monaco-editor/react";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { useContext, useMemo } from "react";
import Logo from "@/app/favicon.svg";
import streamingText from "../streamingText";
import StreamingText from "../streamingText";
import { ContentCopyRounded } from "@mui/icons-material";
import { showNotification } from "../notification";
import json5 from "json5";
import CustomInput from "../customTextField";
import TooltipCustom from "../tooltip";
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

const CustomAiResponse = ({ messages, loading }) => {
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
                minWidth: "70%",
                maxWidth: "80%",
              }}
            >
              <RenderMessages message={isValidJson(message.content)} />
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
  const { theme } = useContext(ThemeContext);

  const renderEditor = (item, index) => {
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
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      getDataToString(item.content)
                    );
                    showNotification({
                      content: "Copied to clipboard",
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
              backgroundColor: "#000000",
              padding: "1rem",
              color: "whitesmoke",
            },
            ":hover": {
              "& .MuiInputAdornment-root": {
                opacity: 1,
                right: "1rem",
                top: "1rem",
              },
            },
          }}
        />
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
                  return renderEditor(item, index);

                case "array":
                  return renderEditor(item, index);

                case "objectArray":
                  return renderEditor(item, index);

                case "json":
                  return renderEditor(item, index);

                case "jsonArray":
                  return renderEditor(item, index);

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
                            content: "Link copied to clipboard",
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
