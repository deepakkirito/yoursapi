import { ThemeContext } from "@/utilities/context/theme";
import {
  catchError,
  getDataToString,
  isValidJson,
} from "@/utilities/helpers/functions";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { ContentCopyRounded, RefreshRounded } from "@mui/icons-material";
import { showNotification } from "../notification";
import StreamingText from "../streamingText";
import TooltipCustom from "../tooltip";
import Markdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import { CreateAlertContext } from "@/utilities/context/alert";
import useCustomWindow from "@/utilities/helpers/hooks/window";
import { postCustomDataApi } from "@/utilities/api/customDataApi";

const aiImage =
  "https://cdn.glitch.global/1451944e-7aa5-4b35-8561-bbbd6e79fae9/happy-hacker.gif?v=1682951858146";

const CustomTypography = ({ children }) => (
  <Typography
    variant="body1"
    color="text.primary"
    sx={{ width: "100%", overflowWrap: "break-word" }}
  >
    {children}
  </Typography>
);

const CustomAiResponse = ({ messages, loading, data, handleRetry }) => {
  const [profile] = useLocalStorage("profile");
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
                color: "text.primary",
                width: message.role === "user" ? "2.5rem" : "4rem",
                height: message.role === "user" ? "2.5rem" : "4rem",
              }}
              src={message.role === "user" ? profile : aiImage}
            />
            <Box
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
              <RenderMessages
                message={isValidJson(message.content)}
                data={data}
                handleRetry={() => handleRetry(message)}
              />
            </Box>
          </Box>
        ))}
      {loading && <LoadingMessage />}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default CustomAiResponse;

const LoadingMessage = () => (
  <Box id="loading" className="flex gap-2 items-start w-full">
    <Avatar sx={{ color: "text.primary", marginTop: "0.2rem" }} src={aiImage} />
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
      <Avatar
        sx={{
          color: "text.primary",
          width: "10rem",
          height: "10rem",
        }}
        src={aiImage}
      />
      <StreamingText text="Thinking..." speed={100} />
    </Box>
  </Box>
);

const RenderMessages = ({ message, handleRetry }) => {
  const searchparams = useSearchParams();
  const { theme } = useContext(ThemeContext);
  const { setAlert } = useContext(CreateAlertContext);
  const apiId = searchparams.get("id");
  const window = useCustomWindow();
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleUpdateData = async (option, data) => {
    setUpdateLoading(true);
    try {
      const res = await postCustomDataApi(apiId, { data, option });
      showNotification({ content: res.data.message });
      window.location.reload();
    } catch (err) {
      catchError(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Box
      className="p-2 w-full overflow-hidden user"
      sx={{ userSelect: "text" }}
    >
      {message.valid ? (
        Array.isArray(message.content) ? (
          message.content.map((item, index) => (
            <Box key={index} className="flex gap-2 items-start flex-col">
              {item.type === "text" && (
                <CustomTypography>{item.content}</CustomTypography>
              )}
              {["object", "array", "json", "code"].includes(item.type) && (
                <CodeBlock content={getDataToString(item.content)} />
              )}
              {item.type === "html" && <HtmlPreview content={item.content} />}
            </Box>
          ))
        ) : (
          <CustomTypography>{message.content}</CustomTypography>
        )
      ) : (
        <ErrorMessage content={message.content} handleRetry={handleRetry} />
      )}
    </Box>
  );
};

const CodeBlock = ({ content }) => (
  <Box className="relative w-full">
    <TooltipCustom title="Copy to clipboard">
      <ContentCopyRounded
        className="absolute top-6 right-2 cursor-pointer"
        color="secondary"
        onClick={() => {
          navigator.clipboard.writeText(content);
          showNotification({ content: "Copied" });
        }}
      />
    </TooltipCustom>
    <pre className="p-3 bg-gray-900 text-white rounded-lg overflow-auto">
      {content}
    </pre>
  </Box>
);

const HtmlPreview = ({ content }) => (
  <Box className="flex gap-2 items-center w-full">
    <Box className="flex gap-2 items-start flex-col w-full">
      <Typography
        component="iframe"
        srcDoc={content}
        sx={{
          minWidth: "30rem",
          maxWidth: "40rem",
          height: "30rem",
          borderRadius: "0.5rem",
        }}
      />
    </Box>
    <TooltipCustom title="Copy HTML">
      <ContentCopyRounded
        className="cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(content);
          showNotification({ content: "Copied" });
        }}
      />
    </TooltipCustom>
  </Box>
);

const ErrorMessage = ({ content, handleRetry }) => (
  <Box className="flex flex-col gap-2 items-start">
    <Typography color="error">{content}</Typography>
    <Button
      variant="contained"
      size="small"
      startIcon={<RefreshRounded />}
      onClick={handleRetry}
    >
      Retry
    </Button>
  </Box>
);
